name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v3

      - name: Setup Node.js 16
        uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Install Dependencies
        run: npm ci
      - id: check_files
        uses: andstor/file-existence-action@v2.0.0
        with:
          files: ".changeset/pre.json"
      - if: steps.check_files.outputs.files_exists == 'true'
        id: set_var
        run: |
          content=`cat ${GITHUB_WORKSPACE}/.changeset/pre.json`
          # the following lines are only required for multi line json
          content="${content//'%'/'%25'}"
          content="${content//$'\n'/'%0A'}"
          content="${content//$'\r'/'%0D'}"
          # end of optional handling for multi line json
          echo "::set-output name=packageJson::$content"
      - if: steps.check_files.outputs.files_exists == 'true'
        run: |
          echo "${{fromJson(steps.set_var.outputs.packageJson).mode}}"
      - if: steps.check_files.outputs.files_exists == 'true' && fromJson(steps.set_var.outputs.packageJson).mode == 'pre'
        run: |
          npx changeset pre exit
          git config --global user.email "shawntompke@gmail.com"
          git config --global user.name "Shawn Tompke"
          git add .
          git commit -m 'ci(changesets): exit pre release';
          git push origin main;

      - name: Checkout Repo
        uses: actions/checkout@v3
      - name: Setup Node.js 16
        uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Install Dependencies
        run: npm ci

      - name: Create Release Pull Request or Publish to npm
        id: changesets
        uses: changesets/action@v1
        with:
          # This expects you to have a script called release which does a build for your packages and calls changeset publish
          publish: node tools/scripts/publish-to-npm.js
          commit: "ci(changesets): release packages"
          title: "ci(changesets): release packages"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      # - name: Send a Slack notification if a publish happens
      #   if: steps.changesets.outputs.published == 'true'
      #   # You can do something when a publish happens.
      #   run: my-slack-bot send-notification --message "A new version of ${GITHUB_REPOSITORY} was published!"