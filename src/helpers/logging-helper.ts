'use strict'
const isDebug = true;
const info =(...msg : any) => {
    if (isDebug) {
        console.log(msg.join(" "));
    }
}

const error = (msg:string | Object) => {
    console.error(msg);
}

export const Log = {
    info,
    error
};
