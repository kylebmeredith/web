function clamp(val, min, max) {
    if (val > max) {
        val = max;
    } else if (val < min) {
        val = min;
    }
    return val;
}

// maps to a specific range within the 0 to 1 of the control variable
function rangeMap(control, start, stop, newMin, newMax, clampVal) {
    let newVal = map(control, start, stop, newMin, newMax);
    if (clampVal) {
        newVal = clamp(newVal, min(newMin,newMax), max(newMin,newMax));
    }
    return newVal;
}