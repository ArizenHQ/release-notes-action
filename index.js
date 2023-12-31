const { execSync } = require("child_process");
const { compareVersions } = require("compare-versions");

const core = require("@actions/core");
const github = require("@actions/github");

try {
  const oldestTag = core.getInput("latest-release-tag");
  const newestTag = core.getInput("release-candidate-tag");

  console.log("latest-release-tag", oldestTag);
  console.log("release-candidate-tag", newestTag);

  const comparisonResult = compareVersions(oldestTag, newestTag);

  if (comparisonResult === 0) {
    console.log("Same tag, no notes");
    core.setOutput("notes", "NONE");
  } else if (comparisonResult === 1) {
    console.log("latest release is newer than release candidate, rollback");
    core.setOutput("notes", "ROLLBACK");
  } else {
    console.log("Generate release notes");
    // get tags
    execSync("git config --global --add safe.directory /github/workspace");
    // this overrides grafted checkouts when a tag is checked out
    execSync("git fetch --unshallow origin master");
    execSync("git fetch --tags >/dev/null 2>&1");
    //find diffs
    const commitsCmd = `git log --format="%s [merger: %an]" ^${oldestTag} ${newestTag}`;
    const dbMigrationsCmd = `git log --pretty=oneline ${newestTag}...${oldestTag}  --name-status | grep "^A\\s"|grep db/data | awk '{print $2}'`;
    const schemaMigrationsCmd = `git log --pretty=oneline ${newestTag}...${oldestTag}  --name-status | grep "^A\\s"|grep db/migrate | awk '{print $2}'`;
    const gitVersion = `git version`;

    const commits = execSync(commitsCmd).toString();
    const dbMigrations = execSync(dbMigrationsCmd).toString();
    const schemaMigrations = execSync(schemaMigrationsCmd).toString();
    const gitVersionOutput = execSync(gitVersion).toString();

    console.log("gitVersionOutput", gitVersionOutput);

    let notes = `COMMITS\n=======\n\n${commits}`;

    if (dbMigrations) {
      notes += `\n\nDATA MIGRATIONS 👇⚠️👇\n=====================\n\n${dbMigrations}`;
    }

    if (schemaMigrations) {
      notes += `\n\nSCHEMA MIGRATIONS 👇⚠️👇\n=======================\n\n${schemaMigrations}`;
    }

    // if no commits, set notes to NONE
    if (commits === "") {
      core.setOutput("notes", "NONE");
    } else {
      core.setOutput("notes", notes);
    }
  }
} catch (error) {
  console.log(error);
  core.setFailed(error.message);
}
