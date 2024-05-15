document.addEventListener('DOMContentLoaded', function() {
    const replaceRadio = document.getElementById('blockModeReplace');
    const deleteRadio = document.getElementById('blockModeDelete');
    const outputBlockContainer = document.getElementById('outputBlockContainer');

    replaceRadio.addEventListener('change', function() {
        if (this.checked) {
            outputBlockContainer.style.display = 'inline';
        }
    });

    deleteRadio.addEventListener('change', function() {
        if (this.checked) {
            outputBlockContainer.style.display = 'none';
        }
    });
});

const blocks = [];

function addBlock() {
    const originBlock = document.getElementById('blockInput').value.trim();
    const replaceBlock = document.getElementById('blockOutput').value.trim();
    const action = document.querySelector('input[name="action"]:checked').value;

    if (originBlock && (action === 'replace' && replaceBlock || action === 'delete')) {
        const block = { originBlock, replaceBlock, action };
        blocks.push(block);
        document.getElementById('blockInput').value = '';
        document.getElementById('blockOutput').value = '';
        updatePreviewArea();
    }
}

function updatePreviewArea() {
    const previewArea = document.querySelector('.preview-area');
    previewArea.innerHTML = '';

    blocks.forEach((block, index) => {
        const container = document.createElement('div');
        container.className = 'flex-container';

        const inputBlock = document.createElement('input');
        inputBlock.type = 'text';
        inputBlock.value = block.originBlock;
        inputBlock.onchange = (e) => {
            block.originBlock = e.target.value.trim();
        };

        const outputBlock = document.createElement('input');
        outputBlock.type = 'text';
        outputBlock.value = block.replaceBlock;
        outputBlock.onchange = (e) => {
            block.replaceBlock = e.target.value.trim();
        };
        if (block.action === 'delete') {
            outputBlock.style.display = 'none';
        }

        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';

        // Create Replace radio button and label
        const replaceRadio = document.createElement('input');
        replaceRadio.type = 'radio';
        replaceRadio.id = `replace${index}`;
        replaceRadio.name = `action${index}`;
        replaceRadio.value = 'replace';
        replaceRadio.checked = block.action === 'replace';
        replaceRadio.onchange = () => {
            block.action = 'replace';
            outputBlock.style.display = 'inline';
        };
        const replaceLabel = document.createElement('label');
        replaceLabel.htmlFor = `replace${index}`;
        replaceLabel.className = 'btn';
        replaceLabel.textContent = 'Replace';

        // Create Delete radio button and label
        const deleteRadio = document.createElement('input');
        deleteRadio.type = 'radio';
        deleteRadio.id = `delete${index}`;
        deleteRadio.name = `action${index}`;
        deleteRadio.value = 'delete';
        deleteRadio.checked = block.action === 'delete';
        deleteRadio.onchange = () => {
            block.action = 'delete';
            outputBlock.style.display = 'none';
        };
        const deleteLabel = document.createElement('label');
        deleteLabel.htmlFor = `delete${index}`;
        deleteLabel.className = 'btn';
        deleteLabel.textContent = 'Delete';

        container.appendChild(inputBlock);
        container.appendChild(outputBlock);
        btnGroup.appendChild(replaceRadio);
        btnGroup.appendChild(replaceLabel);
        btnGroup.appendChild(deleteRadio);
        btnGroup.appendChild(deleteLabel);
        container.appendChild(btnGroup);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Item';
        deleteButton.style.marginLeft = '10px';
        deleteButton.onclick = () => {
            blocks.splice(index, 1);
            updatePreviewArea();
        };
        container.appendChild(deleteButton);

        previewArea.appendChild(container);
    });
}

function updatePreview() {
    const fileContent = generateFileContent();
    const filePreview = document.getElementById('filePreview');
    filePreview.textContent = fileContent;
}

function generateFileContent(className, functionName) {
    let fileContent = `using GBX.NET;\nusing GBX.NET.Engines.Game;\nclass CustomReplaceProfiles{\n    static float PI = (float)Math.PI;\n    public static void ${functionName}(Map map){\n`;

    blocks.forEach(block => {
        if (block.action === 'replace') {
            fileContent += `        map.replace("${block.originBlock}", new BlockChange(BlockType.Block,"${block.replaceBlock}"));\n`;
        } else if (block.action === 'delete') {
            fileContent += `        map.delete("${block.originBlock}");\n`;
        }
    });

    fileContent += '        map.placeStagedBlocks();\n';
    fileContent += '    }\n}\n';

    fileContent += `
class DiagBlockChange : BlockChange{
    public DiagBlockChange(BlockType blockType, string model) : base(blockType,model){}
    public DiagBlockChange(BlockType blockType, string model, Vec3 absolutePosition) : base(blockType,model,absolutePosition){}
    public DiagBlockChange(BlockType blockType, string model, Vec3 absolutePosition, Vec3 pitchYawRoll) : base(blockType,model,absolutePosition,pitchYawRoll){}
    public DiagBlockChange(Vec3 absolutePosition) : base(absolutePosition){}
    public DiagBlockChange(Vec3 absolutePosition, Vec3 pitchYawRoll) : base(absolutePosition,pitchYawRoll){}
    public override void changeBlock(CGameCtnBlock ctnBlock, Block @block){
        switch (ctnBlock.Direction){
            case Direction.North:
                block.relativeOffset(new Vec3(0,0,0));
                break;
            case Direction.East:
                block.relativeOffset(new Vec3(0,0,-32));
                break;
            case Direction.South:
                block.relativeOffset(new Vec3(-64,0,-32));
                break;
            case Direction.West:
                block.relativeOffset(new Vec3(-64,0,0));
                break;
        }
        if (model != "") {
            block.blockType = blockType;
            block.model = model;
        }
        block.relativeOffset(absolutePosition);
        block.pitchYawRoll += pitchYawRoll;
    }
}`;
    return fileContent;
}
