const blocks = [];

function addBlock() {
    const originBlock = document.getElementById('originBlock').value.trim();
    const replaceBlock = document.getElementById('replaceBlock').value.trim();
    const action = document.getElementById('action').value;
    if (originBlock && (action === 'replace' && replaceBlock || action === 'delete')) {
        blocks.push({ originBlock, replaceBlock, action });
        document.getElementById('originBlock').value = '';
        document.getElementById('replaceBlock').value = '';
        updateBlocksList();
    }
}

function updateBlocksList() {
    const list = document.getElementById('blocksList');
    list.innerHTML = '';
    blocks.forEach((block, index) => {
        const item = document.createElement('li');
        item.textContent = `${block.originBlock} | ${block.replaceBlock || 'N/A'} | ${block.action}`;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = function() { deleteBlock(index); };
        item.appendChild(deleteBtn);
        list.appendChild(item);
    });
}

function deleteBlock(index) {
    blocks.splice(index, 1);
    updateBlocksList();
}

function generateAndDownloadCode() {
    const className = document.getElementById('className').value.trim();
    if (!className) {
        alert('Please enter a valid class name.');
        return;
    }
    let code = `using GBX.NET;\nusing GBX.NET.Engines.Game;\n\nclass ${className}{\n    static float PI = (float)Math.PI;\n    public static void CPBoost(Map map){\n`;

    blocks.forEach(block => {
        if (block.action === 'replace') {
            code += `        map.replace("${block.originBlock}", new BlockChange(BlockType.Block,"${block.replaceBlock}"));\n`;
        } else if (block.action === 'delete') {
            code += `        map.delete("${block.originBlock}");\n`;
        }
    });

    code += '    }\n}\n\nclass DiagBlockChange : BlockChange{\n    public DiagBlockChange(BlockType blockType, string model) : base(blockType, model) {}\n    public DiagBlockChange(BlockType blockType, string model, Vec3 absolutePosition) : base(blockType, model, absolutePosition) {}\n    public DiagBlockChange(BlockType blockType, string model, Vec3 absolutePosition, Vec3 pitchYawRoll) : base(blockType, model, absolutePosition, pitchYawRoll) {}\n    public DiagBlockChange(Vec3 absolutePosition) : base(absolutePosition) {}\n    public DiagBlockChange(Vec3 absolutePosition, Vec3 pitchYawRoll) : base(absolutePosition, pitchYawRoll) {}\n\n    public override void changeBlock(CGameCtnBlock ctnBlock, Block @block) {\n        // Insert logic here based on direction\n    }\n}';
    
    const uuid = crypto.randomUUID();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${className}_${uuid}.cs`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();
});
