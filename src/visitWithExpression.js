import visit from "./visitor"

export default function visitWithExpression(node1, node2, array) {
    if (node1 !== undefined && node1.kind !== undefined) {
        switch (node1.kind) {
            case "functionDefinition": return visitFunctionDefinition(node1, node2, array);
            case "pattern": return visitPattern(node1, node2, array);
            case "listPattern": return visitListPattern(node1, node2, array);
            case "emptyListPattern": return visitEmptyListPattern(node1, node2, array);
            case "typeSignature": return visitTypeSignature(node1, node2, array);
            case "functionApplication": return visitFunctionApplication(node1, node2, array);
            case "functionName": return visitFunctionName(node1, node2, array);
            case "bracketedExpression": return visitBracketedexpression(node1, node2, array);
            case "expression": return visitExpression(node1, node2, array);
        }
        return array;
    }
    return array;
}

function displayErrorIfSame(node1, node2) {
    if (visit(node1, node2, [], []).length === 0) {
        return {
           // message: "Pattern violation. This pattern was marked invalid by the instructor.",
            name: node1.name,
            lineNumber: node1.lineNumber,
            startPosition: node1.startPosition,
            endPosition: node1.endPosition,
        }
    } else {
        return null;
    }
}

function visitFunctionDefinition(node1, node2, array) {
    if (node1.kind === node2.kind) {
        array.push(displayErrorIfSame(node1, node2));
    }

    visitWithExpression(node1.expression, node2, array);

    for (let i = 0; i < node1.patterns.length; i++) {
        visitWithExpression(node1.patterns[i], node2, array);
    }
    return array;
}

function visitListPattern(node1, node2, array) {
    if (node1.kind === node2.kind) {
        array.push(displayErrorIfSame(node1, node2));
    }
    return array;
}

function visitEmptyListPattern(node1, node2, array) {
    if (node1.kind === node2.kind) {
        array.push(displayErrorIfSame(node1, node2));
    }
    return array;
}

function visitFunctionName(node1, node2, array) {
    if (node1.kind === node2.kind) {
        array.push(displayErrorIfSame(node1, node2));
    }
    return array;
}

function visitExpression(node1, node2, array) {
    if (node1.kind === node2.kind) {
        array.push(displayErrorIfSame(node1, node2));
    }
    return array;
}

function visitPattern(node1, node2, array) {
    if (node1.kind === node2.kind) {
        array.push(displayErrorIfSame(node1, node2));
    }
    for (let i = 0; i < node1.arguments.length; i++) {
        visitWithExpression(node1.arguments[i], node2, array);
    }
    visitWithExpression(node1.expression, node2, array);
    return array;
}

function visitFunctionApplication(node1, node2, array) {
    if (node1.kind === node2.kind) {
        array.push(displayErrorIfSame(node1, node2));
    }
    if (!node2.isUnderscore) {
        for (let i = 0; i < node1.arguments.length; i++) {
            visitWithExpression(node1.arguments[i], node2, array);
        }
        visitWithExpression(node1.functionName, node2, array);
    }
    return array;
}

function visitBracketedexpression(node1, node2, array) {
    if (node1.kind === node2.kind) {
        array.push(displayErrorIfSame(node1, node2));
    }
    if (!node2.isUnderscore) {
        visitWithExpression(node1.expression, node2, array);
    }
    return array;
}
