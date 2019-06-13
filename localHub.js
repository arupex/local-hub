
const ARGS = process.argv
    .filter(e => e.indexOf('=') !== -1)
    .reduce((acc, value) => {
        let kv = value.split('=');
        acc[kv[0].replace(/^-*/g, '')] = kv[1];
        return acc;
    }, {});

const express = require('express');
const ProjectScanner = require('./lib/walk');
const GitCli = require('./lib/gitcli');
const app = express();
const port = ARGS.port || 1337;

app.use(express.static(__dirname + '/public'));

app.get('/projects', (req, res) => res.send(new ProjectScanner().scan(process.cwd())));

app.get('/projects/:projectName/branches', (req, res) => {
    const projects = new ProjectScanner().scan(process.cwd());

    let project = projects.find(({name}) => {
        return name === decodeURIComponent(req.params.projectName);
    });
    const branches = new GitCli(project.cwd).getBranches();

    res.send(branches);
});

app.delete('/projects/:projectName/branches', (req, res) => {
    const projects = new ProjectScanner().scan(process.cwd());

    let project = projects.find(({name}) => {
        return name === decodeURIComponent(req.params.projectName);
    });

    let gitCli = new GitCli(project.cwd);
    const existingBranches = gitCli.getBranches();

    let deleteBranchs = (branchName) => {
        if(branchName!=='master' && branchName.indexOf('*') === -1){
            console.log(`deleting project:${project.name} branch: ${branchName}`);
            gitCli.deleteBranch({branchName : `${branchName}`})
        }
    };

    if(req.query.branches) {
        let branches = decodeURIComponent(req.query.branches).split(',');
        branches.forEach(deleteBranchs)
    }
    else {
        existingBranches.forEach(deleteBranchs)
    }

    const branchesLeft = gitCli.getBranches();

    res.send(branchesLeft);
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));