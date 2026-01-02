# Intent Resolution Rules — v33 (Engineering Rebuild)

**Version:** v33 - Engineered from First Principles  
**Status:** 🚧 In Development  
**Last Updated:** 2026-01-02 23:17 IST

---

## 🏗️ **Architecture: 5 Core Principles → 23 Rules**

This system is built on **5 fundamental principles** that govern AI behavior:

---

## **PRINCIPLE 1: STATE MACHINE BEHAVIOR**

The AI maintains a **state** that evolves with each message. Only the **final state** is output.

### **Rules:**

**1. FINAL STATE RULE**
Output only the final resolved state. The conversational journey is irrelevant.

**2. OVERRIDE SUPREMACY RULE**
Later instructions completely replace earlier conflicting instructions. Overridden information is deleted, not mentioned.
- **Engineering:** Maintain a state object where keys are overwritten by later values.
- **Example:** `state.context = "Christmas"` → `state.context = "Diwali"` → Output: "Diwali" only

**21. ZERO-HISTORY EXPOSURE RULE**
The output must be self-contained. Never reference the evolution of state.
- **Forbidden:** "changed from", "updated to", "previously", "now"
- **Engineering:** Output `state` object directly, never `state.history`

---

## **PRINCIPLE 2: SEMANTIC PRESERVATION**

Preserve **meaning** and **semantic entities**, not just words.

### **Rules:**

**3. SINGLE-MENTION PRESERVATION RULE**
Every unique semantic entity mentioned must appear in output unless explicitly overridden.
- **Engineering:** Track entities by semantic ID, not string matching
- **Example:** "Joseph Reed" and "J. Reed" = same entity (deduplicate)
- **Example:** "cups" and "cups and saucers set" = different entities (preserve both)

**4. DEDUPLICATION WITHOUT LOSS RULE**
Merge identical semantic entities. Preserve distinct semantic entities even if they share components.
- **Engineering:** Use semantic hashing, not string matching
- **Example:** `hash("cups") ≠ hash("cups and saucers set")` → preserve both
- **Example:** `hash("Diwali context") == hash("On Diwali context")` → merge

**23. ENTITY NORMALIZATION RULE**
Resolve aliases to canonical forms following conventional standards.
- **Engineering:** Apply normalization rules: "Jr." suffix goes after full name
- **Example:** "Jr.J.Reed" where J=Joseph → "Joseph Reed Jr." (not "Junior Joseph Reed")

---

## **PRINCIPLE 3: INSTRUCTION VS DATA**

Distinguish between **instructions** (execute), **data** (preserve), and **context** (inject).

### **Rules:**

**13. CONTEXT ≠ ACTION RULE**
Context modifies existing state but doesn't create new state.
- **Engineering:** `context` is metadata, not data
- **Example:** "It's Diwali" → `state.context = "Diwali"`, not `state.items.push("Diwali")`

**14. OUTPUT-ONLY RULE**
Execute instructions silently. Output only the resulting data.
- **Engineering:** Parse instructions into state mutations, output final state
- **Instruction Pattern:** "Remove X", "Replace X with Y", "Change to Z"
- **Execution:** `delete state.X; state.Y = true;` → Output: "Y"
- **Forbidden:** Outputting the instruction itself

**22. CONTEXT INJECTION RULE**
If context exists in state, inject it once at the beginning of output.
- **Engineering:** `if (state.context) { output = state.context + ", " + output; }`
- **Mandatory:** Context must appear if it exists in final state

---

## **PRINCIPLE 4: STRUCTURAL INTELLIGENCE**

Organize output for maximum coherence and readability.

### **Rules:**

**17. STRUCTURAL COHERENCE RULE**
Group semantically related entities together.
- **Engineering:** Cluster by `entity.category` before output
- **Example:** All `category="edible"` items together, then `category="non-edible"`

**18. INTENT DENSITY RULE**
Every sentence must add new information. Remove redundancy.
- **Engineering:** Filter out sentences where `information_gain == 0`

**19. CROSS-PROMPT CONSOLIDATION RULE**
Merge related instructions into unified output.
- **Engineering:** Detect `task.parent_id` and merge children into parent

---

## **PRINCIPLE 5: ZERO ASSUMPTIONS**

Never infer information not explicitly stated.

### **Rules:**

**9. SCOPE LOCK RULE**
Never generalize or expand scope.
- **Engineering:** Preserve `scope.specificity` exactly as stated
- **Example:** "class 5 students" → `scope = "class 5 students"` (not "students")

**12. NO ASSUMPTION RULE**
Never add information not present in input.
- **Engineering:** `if (!input.contains(X)) { output.exclude(X); }`
- **Example:** "Joseph's jacket" → "Joseph has a jacket" (not "Joseph wears a jacket")
- **Rationale:** "has" is neutral, "wears" is assumed action

---

## 🔧 **Engineering Implementation**

### **Pseudo-Algorithm:**

```javascript
function resolveIntent(messages) {
  // Initialize state
  let state = {
    task: null,
    context: null,
    entities: new Map(), // semantic_id -> entity
    categories: new Map(), // category -> [entities]
  };
  
  // Process each message
  for (const message of messages) {
    const parsed = parseMessage(message);
    
    // Apply state mutations
    for (const mutation of parsed.mutations) {
      if (mutation.type === 'override') {
        state.entities.set(mutation.key, mutation.value);
      } else if (mutation.type === 'delete') {
        state.entities.delete(mutation.key);
      } else if (mutation.type === 'context') {
        state.context = mutation.value; // Latest context wins
      }
    }
  }
  
  // Generate output from final state
  return generateOutput(state);
}

function generateOutput(state) {
  let output = "";
  
  // Inject context if exists (Rule 22)
  if (state.context) {
    output += `On ${state.context}, `;
  }
  
  // Group entities by category (Rule 17)
  const grouped = groupByCategory(state.entities);
  
  // Output each category
  for (const [category, entities] of grouped) {
    output += `include ${category} items: `;
    output += entities.map(e => e.name).join(", ");
    output += ". ";
  }
  
  return output.trim();
}
```

---

## 📊 **Test-Driven Validation**

### **Test 1: State Machine**
```
Input: "Make it blue. Make it red."
State Evolution: {color: "blue"} → {color: "red"}
Output: "Make it red."
✅ Rule 2 (Override Supremacy)
```

### **Test 2: Semantic Preservation**
```
Input: "cups, saucers, cups and saucers set"
Semantic IDs: [entity_1, entity_2, entity_3]
Output: "cups, saucers, cups and saucers set"
✅ Rule 4 (Compound Preservation)
```

### **Test 3: Instruction Execution**
```
Input: "Remove breakfast plates and replace with lunch sets"
State Mutation: delete(breakfast_plates); add(lunch_sets);
Output: "lunch sets"
✅ Rule 14 (Execute, Don't Output)
```

### **Test 4: Context Injection**
```
Input: "Add lights. It's Diwali. Add diyas."
State: {context: "Diwali", items: ["lights", "diyas"]}
Output: "On Diwali, add lights and diyas."
✅ Rule 22 (Context Injection)
```

---

## 🎯 **Key Differences from v32.8**

| Aspect | v32.8 (Iterative) | v33 (Engineered) |
|--------|-------------------|------------------|
| **Approach** | Rule-by-rule fixes | Principle-based architecture |
| **Structure** | Flat 23 rules | 5 principles → 23 rules |
| **Logic** | Natural language | State machine + algorithms |
| **Testability** | Manual examples | Algorithmic validation |
| **Maintainability** | Add rules as needed | Derive rules from principles |

---

## 🚀 **Next Steps**

1. **Implement State Machine:** Convert natural language rules to state mutations
2. **Semantic Hashing:** Build entity deduplication based on meaning, not strings
3. **Category Detection:** Auto-detect semantic categories (edible vs non-edible)
4. **Instruction Parser:** Regex patterns for "Remove X", "Replace X with Y"
5. **Test Suite:** Automated validation against all test cases

---

*This is engineering, not patching.* 🏗️
