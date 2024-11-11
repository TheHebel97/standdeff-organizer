'use strict'
const isDebug = true;
const info = (...msg: any) => {
    if (isDebug) {
        msg.forEach((m: any) => {
            console.log(m);
        });
    }
}

const error = (msg: string | Object) => {
    console.error(msg);
}

export const Log = {
    info,
    error
};
