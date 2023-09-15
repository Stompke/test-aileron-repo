#!/usr/bin/env node

const { exec } = require('child_process');
const { exit } = require('process');
const fs = require('fs');



exec('npx changeset status --verbose --output="./testing.json"', { encoding: 'utf8' },  ( async (error, stdout, stderr) => {
  if (error) {
    console.error(error);
    exitCode = 1;
    exit(1);
  }

  // Grab new release notes data
  await fs.readFile('./testing.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const newReleaseNotes = JSON.parse(data);

    const newDataStructure = newReleaseNotes;

    newDataStructure.releases.forEach(release => {
        release.major = [];
        release.minor = [];
        release.patch = [];
        newReleaseNotes.changesets.forEach(changeset => {
            if(changeset.releases[0].name == release.name) {
                if(changeset.releases[0].type == "major") {
                    release.major.push(changeset.summary)
                }
                if(changeset.releases[0].type == "minor") {
                    release.minor.push(changeset.summary)
                }
                if(changeset.releases[0].type == "patch") {
                    release.patch.push(changeset.summary)
                }
            }
        })
    })


    // Append new release notes data to release notes file
    fs.readFile('./packages/docs/src/release-notes.md', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
  
      
      const releases = newReleaseNotes.releases.map((release) => release);
      

      releases.forEach(release => {
        release.changesetData = [];
        release.changesets.map(changesetId => {

            newReleaseNotes.changesets.forEach(releaseChangesets => {
                if(releaseChangesets.id == changesetId) {
                    release.changesetData.push(releaseChangesets.summary)
                }
            }) 
        })

        })


      let releasesMarkdown = "";
      releases.forEach((release) => {
        let majorReleasesText = ""
        let minorReleasesText = ""
        let patchReleasesText = ""
        release.minor.forEach(data => minorReleasesText += `- ${data}\n\n`)
        release.major.forEach(data => majorReleasesText += `- ${data}\n\n`)
        release.patch.forEach(data => patchReleasesText += `- ${data}\n\n`)
        // releasesMarkdown += `## ${release.name}@${release.newVersion} \n\n ${release.major.length > 0 ? `### Major Changes \n\n` : ``} ${majorReleasesText} ${release.minor.length > 0 ? `### Minor Changes \n\n` : ``} ${minorReleasesText} ${release.patch.length > 0 ? `### Patch Changes \n\n` : ``} ${patchReleasesText} \n\n`;
        releasesMarkdown += `## ${release.name}@${release.newVersion}\n\n` +
        (release.major.length > 0 ? `#### Major Changes\n\n` : "") +
        `${majorReleasesText}` +
        (release.minor.length > 0 ? `#### Minor Changes\n\n` : "") +
        `${minorReleasesText}` +
        (release.patch.length > 0 ? `#### Patch Changes\n\n` : "") +
        `${patchReleasesText}\n\n`;
        
      }); 
  
      const currentDate = new Date();

      // Prepend the text "# more content" to the beginning of this md file.
      data = `# 🚀 ${currentDate.toDateString()} Release 🚀 \n\n` + releasesMarkdown + "\n\n\n\n\n\n" + data;
  
  
      // save new data to file
      fs.writeFile('./packages/docs/src/release-notes.md', data, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`File updated successfully`);
      });
  
    });
  });



}));
