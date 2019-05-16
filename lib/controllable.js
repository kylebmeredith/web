class Controllable {
    constructor(defaultValue, min, max, clamp, control) {
        this.defaultValue = defaultValue;
        this.min = min;
        this.max = max;
        this.clamp = clamp;
        this.control = control;
    }
    
    update() {
        let normControlValue;
        
        if (this.control) {
            normControlValue = this.control.get();
            
            // map the input value to the range of the controllable
            let mappedControlValue = map(normControlValue, 0., 1., this.min, this.max);
    
            if (this.clamp) {
                if (mappedControlValue < this.min)
                    mappedControlValue = this.min;
                if (mappedControlValue > this.max)
                    mappedControlValue = this.max;
            }
        } else {
            mappedControlValue = this.defaultValue;
        }

        return mappedControlValue;
    }
}

class Control {
    constructor(min, max, get) {
        this.min = min;
        this.max = max;
        this.get = getFunction;
    }
    
    update() {
        let controlValue = map(this.get(), this.min, this.max, 0.0, 1.0);
    }
}


// public class Controllable {
//     String paramName;
//     String selectionKey;
//     Range range;

//     int updateType;

//     ControlParam control;
//     ControlParam adjust;
//     boolean addNoise;

//     //seems like everything is a float? Except ints for colors, but even that can be float
//     // when controlling. If control, else set it to default value. That way itll reset nicely
//     float defaultValue;
//     float value;
    
//     boolean maintain = false;   // maintain current value if hands aren't detected

//     float controlValue;
//     float adjustValue;
//     float noiseValue;

//     boolean reverse = false;

//     public Controllable(String param, String selectionKey, float defaultValue, Range range, int updateType) {
//         this.paramName = param;
//         this.selectionKey = selectionKey;
//         this.defaultValue = defaultValue;
//         this.range = range;
//         this.updateType = updateType;
//         //this.maintain = maintain;
//     }

//     //public Controllable(String param, String selectionKey, Range range, int updateType) {
//     //    Controllable(param, selectionKey, null, range, updateType);
//     //}
    
//     public void resetControl() {
//         control = null;
//         reverse = false;
//         value = defaultValue;
//     }
    
//     public boolean isControlled() {
//         return (this.control != null);    
//     }
        
//     private float mapControl() {
//         float normControlValue, mappedControlValue;
//         // control.get() returns a normalized value between 0 and 1
//         try {
//             normControlValue = control.get();
//         } catch (Throwable t) {
//             // if the handData is null, set it to default value
//             return defaultValue;
//         }

//         // maybe just reverse the input based on reverse? Seems like that would get rid of the mid

//         // map the input value to the range of the controllable
//         if (normControlValue <= .5) {
//             if (reverse)
//                 mappedControlValue = map(normControlValue, 0, 0.5, range.max, range.mid);
//             else
//                 mappedControlValue = map(normControlValue, 0, 0.5, range.min, range.mid);
//         } else {
//             if (reverse)
//                 mappedControlValue = map(normControlValue, 0.5, 1, range.mid, range.min);
//             else
//                 mappedControlValue = map(normControlValue, 0.5, 1, range.mid, range.max);
//         }

//         //if (control.paramName == "positionY") {
//         //    println("norm", normControlValue);
//         //    println("mapped", mappedControlValue);
//         //}

//         if (range.clamp) {
//             if (mappedControlValue < range.min)
//                 mappedControlValue = range.min;
//             if (mappedControlValue > range.max)
//                 mappedControlValue = range.max;
//         }

//         return mappedControlValue;
//     }

//     public void update() {
//         if (isControlled()) {
//             //println("not null", control.paramName);
//             controlValue = mapControl();
//             //println(controlValue);

//             switch (updateType) {
//                 case 0: // direct mapping
//                     value = controlValue;
//                     break;
//                 case 1: // cumulative mapping
//                     value += controlValue;
//                     break;
//                 case 2: // symmetry mapping
//                     value = int(pow(2, int(controlValue)));
//                     break;
//                 case 3: // hue mapping
//                     value = abs(controlValue) % range.max;
//                     break;
//                 case 4: // color speed mapping
//                     value = (value + controlValue) % (range.max * 10);
//                     break;
//             }
//     }
// }