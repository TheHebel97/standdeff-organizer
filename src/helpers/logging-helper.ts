'use strict'
const isDebug = true;
const info =(msg:string | Object) => {
    if (isDebug) {
        console.log(msg);
    }
}

const error = (msg:string | Object) => {
    console.error(msg);
}

export const Log = {
    info,
    error
};
