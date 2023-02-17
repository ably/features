const { compareKeys } = require('./compare');

/**
 * Inspects YAML AST to ensure source constraints are met (e.g. ordered keys).
 * Used as our First Parse: using YAML's mid-level API, rendering a graph of the YAML structure,
 * and then running some of our checks over that structure to check foundational requirements.
 *
 * @param {*} astNode The YAML AST node.
 * @param {string[]} parentKeys Parent keys, also indicating the depth of this node. Nodes at root have an empty array.
 */
function validateStructure(astNode, parentKeys = []) {
  if (astNode === undefined || astNode === null) {
    throw new Error(`Unexpected - astNode value cannot be undefined or null at "${parentKeys}".`);
  }
  if (parentKeys.length > 20) {
    throw new Error('Recursion depth exceeded arbitrary limit.');
  }

  const nodeType = astNode.type;
  let arrayIndex = 0;
  switch (nodeType) {
    case 'MAP':
      validateMapItems(astNode.items, parentKeys);
      break;

    case 'FLOW_SEQ':
    case 'SEQ':
      astNode.items.forEach((item) => {
        validateStructure(item, [...parentKeys, `${arrayIndex}`]);
        arrayIndex += 1;
      });
      break;

    case 'PLAIN':
    case 'BLOCK_LITERAL':
    case 'QUOTE_SINGLE':
      break;

    default:
      throw new Error(`Unhandled YAML AST node type "${nodeType}".`);
  }
}

/**
 * Inspects items of YAML AST map to ensure source constraints are met.
 *
 * @param {*[]} items The YAML AST 'MAP' node items.
 * @param {string[]} parentKeys Parent keys, also indicating the depth of this node. Nodes at root have an empty array.
 */
function validateMapItems(items, parentKeys) {
  let previousKeyValue;
  items.forEach((item) => {
    if (item.type !== 'PAIR') {
      throw new Error('Map items should be pairs.');
    }

    const { key, value } = item;
    if (key.type !== 'PLAIN') {
      throw new Error('Map keys must be plain scalars.');
    }
    const keyValue = key.value;

    if (previousKeyValue && compareKeys(keyValue, previousKeyValue) < 0) {
      throw new Error(`Keys not sorted ("${keyValue}" should not be after "${previousKeyValue}").`);
    }
    previousKeyValue = keyValue;

    // It is normal for `value` to be `null` here, where the map key is 'hanging' in the YAML - e.g. in the case of the
    // 'Hanging Parent Key' in this snippet:
    //
    // ```yaml
    // Some Parent Key:
    //   Hanging Parent Key:
    //   Some Other Key that Does have a Value: Hello World
    // ```
    //
    // The hanging key represents that there is intended to be a node at this location in the tree, but that there is
    // no additional information to convey about this node - above and beyond its name (the key).
    if (value !== null) {
      validateStructure(value, [...parentKeys, key]);
    }
  });
}

module.exports = {
  validateStructure,
};
