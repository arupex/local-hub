
const exec = require('child_process').execSync;

class GitCli {

    constructor(dir) {
        this.dir = dir;
    }

    getBranches() {
        // exec(`git fetch -p`, {cwd: this.dir});
        return exec(`git branch`, {cwd: this.dir}).toString('utf8').split('\n').map((branch) => {
            return branch.trim();
        }).filter(e=>e.length > 1);
    }

    deleteBranch ({branchName}) {
        let toString = exec(`git branch -D ${branchName}`, {cwd: this.dir}).toString('utf8');
        exec(`git fetch -p`, {cwd: this.dir});
        return toString;
    }

}

module.exports = GitCli;