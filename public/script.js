window.onload = () => {
    scan();
};

async function scan() {
    const projects = await (await fetch('/projects')).json();

    const container = document.getElementById('container');

    container.innerHTML = '';

    projects.forEach(({name, cwd}) => {
        const {page, form} = prj(name);

        fetch(`/projects/${name}/branches`).then(async (response) => {
            const branches = await response.json();
            branchControls({project: name, form, branches});
        });

        container.appendChild(page);
    })

}

function prj(prjName) {
    const page = document.createElement('div');
    page.classList.add('panel');
    page.classList.add('panel-info');

    const headPanel = document.createElement('div');
    headPanel.classList.add('panel-heading');
    const panelTitle = document.createElement('div');
    panelTitle.classList.add('panel-title');
    panelTitle.innerText = prjName;
    const btn = button({
        name:prjName,
        text: 'Delete All',
        type:'danger',
        iconography:'alert',
        onclick:()=>deleteAll(prjName),
        style:'float:right;'
    });

    panelTitle.appendChild(btn);
    headPanel.appendChild(panelTitle);

    page.appendChild(headPanel);

    const form = document.createElement('form');
    form.classList.add('form-horizontal');
    form.role = 'form';

    const panelBody = document.createElement('div');
    panelBody.style = 'padding-top:30px;';
    panelBody.classList.add('panel-body');

    panelBody.appendChild(form);

    page.appendChild(panelBody);

    return {page, form};
}

async function deleteAll(prj) {
    await (await fetch(`/projects/${encodeURIComponent(prj)}/branches`, {method : 'DELETE'})).json();
    return scan();
}

async function deleteBranch(prj, branch) {
    await (await fetch(`/projects/${encodeURIComponent(prj)}/branches?names=${encodeURIComponent(branch)}`, { method : 'DELETE'})).json();
    return scan();
}

function button({name, text, type, iconography, onclick, style}) {
    const deleteLink = document.createElement('a');
    deleteLink.id = name;
    deleteLink.href = '#';
    deleteLink.classList.add('btn');
    deleteLink.classList.add(`btn-${type}`);

    deleteLink.style = style;
    deleteLink.onclick = onclick;

    const deleteGlyph = document.createElement('i');
    deleteGlyph.classList.add('glyphicon');
    deleteGlyph.classList.add(`glyphicon-${iconography}`);

    deleteLink.innerText = text;

    deleteLink.appendChild(deleteGlyph);
    return deleteLink;
}

function branchControls({project, form, branches}) {
    branches.forEach((name) => {
        const prjEl = document.createElement('div');
        prjEl.style = "margin-bottom: 25px";
        prjEl.classList.add('input-group');

        const label = document.createElement('span');
        label.classList.add("input-group-addon");
        label.style = "min-width: 400px";

        const labelText = document.createElement('span');
        labelText.style = 'float:right;';
        labelText.innerText = name + '   ';
        label.appendChild(labelText);


        const prjGlyph = document.createElement('i');
        prjGlyph.classList.add('glyphicon');
        prjGlyph.classList.add('glyphicon-indent-left');
        prjGlyph.style = 'float:left;'

        label.appendChild(prjGlyph);

        prjEl.appendChild(label);


        const controls = document.createElement('div');
        controls.classList.add('controls');
        if (name.indexOf('* ') === -1) {

            const deleteLink = button({
                name,
                text:'Delete',
                type:'danger',
                iconography:'alert',
                onclick:()=>deleteBranch(project, name)
            });

            controls.appendChild(deleteLink);
        }
        prjEl.appendChild(controls);

        form.appendChild(prjEl);

    });
}