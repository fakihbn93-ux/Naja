"use client";

import { useEffect, useRef } from "react";
import { useRive, Layout, Fit } from "@rive-app/react-canvas";


export default function LoginAnimation({success}) {


const timer = useRef(null);


const {
    RiveComponent,
    rive
} = useRive({

src:"/animations/naja-login.riv?v=2",

artboard:"logo-naja",

animations:"login_in",

autoplay:false,

layout:new Layout({
    fit:Fit.Contain
})

});



useEffect(()=>{

if(!rive) return;


// jalankan animasi masuk

rive.play("login_in");


// berhentikan setelah logo muncul

timer.current = setTimeout(()=>{

    rive.pause();

},1600);



return ()=>{

clearTimeout(timer.current)

}


},[rive]);





useEffect(()=>{


if(!rive) return;


if(success){


clearTimeout(timer.current);


// lanjutkan sampai LOGIN BERHASIL

rive.play("login_in");


}


},[success,rive]);




return(

<div
style={{
width:"400px",
height:"400px",
background:"transparent"
}}
>

<RiveComponent

style={{
background:"transparent"
}}

/>

</div>

)


}