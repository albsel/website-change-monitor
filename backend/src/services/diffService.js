/**
 * Very simple text diffing logic for PoC.
 * - Compares lengths
 * - Compares normalized text
 * - Produces a basic summary
 *
 * This is also used as a fallback description
 * when the LLM API is not available.
 */

function normalize(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
  }
  
  function diffTexts(oldText, newText) {
    const oldNorm = normalize(oldText);
    const newNorm = normalize(newText);
  
    if (!oldNorm && newNorm) {
      return {
        hasChanges: true,
        summary: 'Initial snapshot created for this page.',
        meta: {
          oldLength: 0,
          newLength: newNorm.length,
          lengthDiff: newNorm.length
        }
      };
    }
  
    if (oldNorm === newNorm) {
      return {
        hasChanges: false,
        summary: 'No significant textual changes detected.',
        meta: {
          oldLength: oldNorm.length,
          newLength: newNorm.length,
          lengthDiff: 0
        }
      };
    }
  
    const oldLen = oldNorm.length;
    const newLen = newNorm.length;
    const lengthDiff = newLen - oldLen;
    const changeRatio = oldLen > 0 ? Math.abs(lengthDiff) / oldLen : 1;
  
    let changeSize;
    if (changeRatio < 0.02) {
      changeSize = 'very small';
    } else if (changeRatio < 0.10) {
      changeSize = 'small';
    } else if (changeRatio < 0.30) {
      changeSize = 'moderate';
    } else {
      changeSize = 'large';
    }
  
    const summary = `Text content changed (${changeSize} change, length diff: ${lengthDiff} characters).`;
  
    return {
      hasChanges: true,
      summary,
      meta: {
        oldLength: oldLen,
        newLength: newLen,
        lengthDiff,
        changeRatio
      }
    };
  }
  
  module.exports = {
    diffTexts
  };
  