(function(){
  'use strict';

  if(window.__yayaUploadPreprocessFast)return;
  window.__yayaUploadPreprocessFast=true;

  const MAX_SIDE=1800;
  const JPEG_QUALITY=0.82;
  const MIN_OPTIMIZE_SIZE=650*1024;

  function isImage(file){
    return !!(file&&String(file.type||'').toLowerCase().startsWith('image/'));
  }

  function extensionlessName(name){
    return String(name||'document').replace(/\.[^.]+$/,'')||'document';
  }

  function imageElementFromFile(file){
    return new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(file);
      const img=new Image();
      img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
      img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('image illisible'));};
      img.src=url;
    });
  }

  async function decodeImage(file){
    if(typeof createImageBitmap==='function'){
      try{return await createImageBitmap(file);}catch(e){}
    }
    return imageElementFromFile(file);
  }

  async function optimizeImage(file){
    if(!isImage(file)||file.size<MIN_OPTIMIZE_SIZE)return file;
    let source;
    try{source=await decodeImage(file);}catch(e){return file;}
    try{
      const sw=Number(source.width||source.naturalWidth)||0;
      const sh=Number(source.height||source.naturalHeight)||0;
      if(!sw||!sh)return file;
      const ratio=Math.min(1,MAX_SIDE/Math.max(sw,sh));
      const w=Math.max(1,Math.round(sw*ratio));
      const h=Math.max(1,Math.round(sh*ratio));
      const canvas=document.createElement('canvas');
      canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d',{alpha:false});
      if(!ctx)return file;
      ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
      ctx.drawImage(source,0,0,w,h);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',JPEG_QUALITY));
      if(!blob||blob.size>=file.size*0.92)return file;
      return new File([blob],extensionlessName(file.name)+'.jpg',{
        type:'image/jpeg',
        lastModified:file.lastModified||Date.now()
      });
    }catch(e){
      return file;
    }finally{
      try{if(source&&typeof source.close==='function')source.close();}catch(e){}
    }
  }

  function wrapFileFunction(name){
    const original=window[name];
    if(typeof original!=='function'||original.__yayaOptimizedUpload)return;
    const wrapped=async function(file){
      if(!file)return original.apply(this,arguments);
      const statusId=name==='traiterDevis'?'devisEtat':name==='traiterAchat'?'achatEtat':name==='traiterDocument'?'docEtat':name==='traiterDevisAjout'?'avEtat':'';
      const status=statusId&&document.getElementById(statusId);
      if(status&&isImage(file)&&file.size>=MIN_OPTIMIZE_SIZE)status.textContent='⏳ Optimisation de l’image…';
      const optimized=await optimizeImage(file);
      return original.call(this,optimized);
    };
    wrapped.__yayaOptimizedUpload=true;
    wrapped.__yayaOriginal=original;
    window[name]=wrapped;
    try{eval(name+'=window[\''+name+'\']');}catch(e){}
  }

  function install(){
    wrapFileFunction('traiterDevis');
    wrapFileFunction('traiterAchat');
    wrapFileFunction('traiterDocument');
    wrapFileFunction('traiterDevisAjout');

    const current=window.lireAvenant;
    if(typeof current==='function'&&!current.__yayaOptimizedUpload){
      const wrapped=function(input){
        const file=input&&input.files&&input.files[0];
        if(input)input.value='';
        if(!file)return;
        if(typeof window.traiterDevisAjout==='function')return window.traiterDevisAjout(file);
        return current.call(this,input);
      };
      wrapped.__yayaOptimizedUpload=true;
      wrapped.__yayaOriginal=current;
      window.lireAvenant=wrapped;
      try{lireAvenant=window.lireAvenant;}catch(e){}
    }
  }

  install();
  setTimeout(install,100);
  setTimeout(install,500);
})();
