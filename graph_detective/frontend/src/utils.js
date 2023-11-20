export function getNewNodePosition(nodes) {
    var offset = 300;
    var rightMostX = -150;
    for (const node of Object.values(nodes)) {
        let xPos = node.position.x

        if (xPos > rightMostX) {
            rightMostX = xPos
        }
    }
    var newXPos = rightMostX + offset;
    return { x: newXPos, y: 150 }
}

export function getNewNodeId(nodes) {
    if (Object.keys(nodes).length === 0) {
        return "0";
    }
    let lastNode = nodes[nodes.length - 1];
    var lastNodeId = Number(lastNode.id)
    var newNodeId = lastNodeId + 1;
    newNodeId = newNodeId.toString()
    return newNodeId;
}

export function isDate(dateString) {
    const dateObj = new Date(dateString);
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/;
    return !isNaN(dateObj) && (dateRegex.test(dateString) || datetimeRegex.test(dateString));
}

export function toDateObject(dateString) {
    return new Date(dateString);
}

export function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export function formatNumberWithDot(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function getRandomFromList(items) {
    // Generate a random index between 0 and the length of the items array
const randomIndex = Math.floor(Math.random() * items.length);

// Get the random item from the array
const randomItem = items[randomIndex];

return randomItem;
}
