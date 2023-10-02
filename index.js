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
    execSync("git fetch --tags");
    //find diffs
    const commitsCmd = `git log --format="%s [merger: %an]" ^${oldestTag} ${newestTag}`;
    const dbMigrationsCmd = `git log --pretty=oneline ${newestTag}...${oldestTag}  --name-status | grep "^A\\s"|grep db/data | awk '{print $2}'`;
    const schemaMigrationsCmd = `git log --pretty=oneline ${newestTag}...${oldestTag}  --name-status | grep "^A\\s"|grep db/migrate | awk '{print $2}'`;

    console.log("commitsCmd", commitsCmd);
    console.log("dbMigrationsCmd", dbMigrationsCmd);
    console.log("schemaMigrationsCmd", schemaMigrationsCmd);

    const commits = execSync(commitsCmd).toString();
    const dbMigrations = execSync(dbMigrationsCmd).toString();
    const schemaMigrations = execSync(schemaMigrationsCmd).toString();

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
  core.setFailed(error.message);
}
