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
            updatePreview();
        };

        const outputBlock = document.createElement('input');
        outputBlock.type = 'text';
        outputBlock.value = block.replaceBlock;
        outputBlock.onchange = (e) => {
            block.replaceBlock = e.target.value.trim();
            updatePreview();
        };
        outputBlock.style.display = block.action === 'delete' ? 'none' : '';

        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';
        btnGroup.appendChild(createRadioButton(`replace${index}`, `action${index}`, 'replace', block.action === 'replace', 'Replace', outputBlock));
        btnGroup.appendChild(createRadioButton(`delete${index}`, `action${index}`, 'delete', block.action === 'delete', 'Delete', outputBlock));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Item';
        deleteButton.style.marginLeft = '10px';
        deleteButton.onclick = () => {
            blocks.splice(index, 1);
            updatePreviewArea();
        };

        container.appendChild(inputBlock);
        container.appendChild(outputBlock);
        container.appendChild(btnGroup);
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

function createRadioButton(id, name, value, isChecked, labelContent, outputBlock) {
    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.id = id;
    radioInput.name = name;
    radioInput.value = value;
    radioInput.checked = isChecked;
    radioInput.onchange = () => {
        blocks.find(b => `action${blocks.indexOf(b)}` === name).action = value;
        outputBlock.style.display = value === 'delete' ? 'none' : '';
        updatePreviewArea();
    };

    const label = document.createElement('label');
    label.htmlFor = id;
    label.className = 'btn';
    label.textContent = labelContent;

    const container = document.createElement('div');
    container.appendChild(radioInput);
    container.appendChild(label);
    return container;
}