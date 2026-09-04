import{o as e,x as t,y as n}from"./supabaseClient-BoOMEchT.js";var r=e(`credit-card`,[[`rect`,{width:`20`,height:`14`,x:`2`,y:`5`,rx:`2`,key:`ynyp8z`}],[`line`,{x1:`2`,x2:`22`,y1:`10`,y2:`10`,key:`1b3vmo`}]]),i=e(`file-text`,[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`,key:`1oefj6`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`,key:`wfsgrz`}],[`path`,{d:`M10 9H8`,key:`b1mrlr`}],[`path`,{d:`M16 13H8`,key:`t4e002`}],[`path`,{d:`M16 17H8`,key:`z1uh3a`}]]),a=e(`printer`,[[`path`,{d:`M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2`,key:`143wyd`}],[`path`,{d:`M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6`,key:`1itne7`}],[`rect`,{x:`6`,y:`14`,width:`12`,height:`8`,rx:`1`,key:`1ue0tg`}]]),o=t(n(),1);function s(){let e=(0,o.useRef)(null),t=(0,o.useRef)(!1),n=(0,o.useRef)(0),r=(0,o.useRef)(0);return{ref:e,scrollLeftBy:(t=350)=>{e.current&&e.current.scrollBy({left:-t,behavior:`smooth`})},scrollRightBy:(t=350)=>{e.current&&e.current.scrollBy({left:t,behavior:`smooth`})},events:{onMouseDown:i=>{i.target.closest(`button`)||i.target.closest(`input`)||i.target.closest(`select`)||e.current&&(t.current=!0,n.current=i.pageX-e.current.offsetLeft,r.current=e.current.scrollLeft,e.current.style.cursor=`grabbing`,e.current.style.userSelect=`none`)},onMouseLeave:()=>{t.current=!1,e.current&&(e.current.style.cursor=`grab`,e.current.style.removeProperty(`user-select`))},onMouseUp:()=>{t.current=!1,e.current&&(e.current.style.cursor=`grab`,e.current.style.removeProperty(`user-select`))},onMouseMove:i=>{if(!t.current||!e.current)return;i.preventDefault();let a=(i.pageX-e.current.offsetLeft-n.current)*1.5;e.current.scrollLeft=r.current-a},onWheel:t=>{e.current&&Math.abs(t.deltaX)===0&&t.deltaY!==0&&e.current.scrollWidth-e.current.clientWidth>0&&(e.current.scrollLeft+=t.deltaY*.8)},style:{cursor:`grab`}}}}var c=(e=``)=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),l=(e=``)=>{let t=String(e).match(/^data:([^;,]+)?(;base64)?,(.*)$/);if(!t)return null;let n=t[1]||`application/octet-stream`,r=!!t[2],i=t[3]||``,a=r?atob(i):decodeURIComponent(i),o=new Uint8Array(a.length);for(let e=0;e<a.length;e+=1)o[e]=a.charCodeAt(e);return new Blob([o],{type:n})},u=(e=``)=>{if(String(e).startsWith(`data:`)){let t=l(e);if(!t)return e;let n=URL.createObjectURL(t);return window.__erpDocumentPreviewUrls=window.__erpDocumentPreviewUrls||[],window.__erpDocumentPreviewUrls.push(n),n}return e},d=(e={})=>{let t=e.fileUrl||e.url||e.src||``,n=e.savedFile||e.file||e.docName||e.name||`Document`,r=c(n);if(!(typeof t==`string`&&/^(data:|blob:|https?:\/\/)/i.test(t))){let e=`File content is not available for preview. Only the saved file name is present in ERP: ${n}`,t=window.open(``,`_blank`,`noopener,noreferrer`);if(!t){window.alert(e);return}t.document.write(`<!doctype html>
<html>
  <head>
    <title>${r}</title>
    <style>
      body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-family: Arial, sans-serif; color: #0f172a; }
      .card { max-width: 520px; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); }
      h1 { margin: 0 0 10px; font-size: 20px; }
      p { margin: 6px 0; color: #475569; line-height: 1.5; }
      code { color: #6d28d9; font-weight: 700; word-break: break-all; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Document file not available</h1>
      <p>ERP me document record saved hai, lekin actual uploaded file content nahi mila.</p>
      <p>Saved File: <code>${r}</code></p>
      <p>Student ko document dobara upload karna hoga, tab preview open hoga.</p>
    </div>
  </body>
</html>`),t.document.close();return}if(String(e.fileType||``).includes(`pdf`)||String(n).match(/\.pdf$/i)||String(t).startsWith(`data:application/pdf`)){let e=u(t),n=window.open(``,`_blank`,`noopener,noreferrer`);if(!n){let t=document.createElement(`a`);t.href=e,t.target=`_blank`,t.rel=`noopener noreferrer`,t.click();return}n.document.write(`<!doctype html>
<html>
  <head>
    <title>${r}</title>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; width: 100%; height: 100%; background: #f8fafc; }
      iframe { width: 100%; height: 100%; border: 0; background: #fff; }
      .fallback { position: fixed; top: 10px; right: 12px; z-index: 2; font-family: Arial, sans-serif; font-size: 12px; }
      .fallback a { color: #4f46e5; font-weight: 700; text-decoration: none; background: #fff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 8px 10px; }
    </style>
  </head>
  <body>
    <div class="fallback"><a href="${e}" download="${r}">Download PDF</a></div>
    <iframe src="${e}" title="${r}"></iframe>
  </body>
</html>`),n.document.close();return}let i=window.open(``,`_blank`,`noopener,noreferrer`);if(!i){let e=document.createElement(`a`);e.href=t,e.target=`_blank`,e.rel=`noopener noreferrer`,e.click();return}let a=String(e.fileType||``).startsWith(`image/`)||String(n).match(/\.(png|jpe?g|webp)$/i)?`<img src="${t}" alt="${r}" />`:`<iframe src="${t}" title="${r}"></iframe>`;i.document.write(`<!doctype html>
<html>
  <head>
    <title>${r}</title>
    <style>
      html, body { margin: 0; width: 100%; height: 100%; background: #111827; }
      body { display: flex; align-items: center; justify-content: center; }
      iframe { width: 100%; height: 100%; border: 0; background: #fff; }
      img { max-width: 100%; max-height: 100%; object-fit: contain; }
    </style>
  </head>
  <body>${a}</body>
</html>`),i.document.close()};export{r as a,i,s as n,a as r,d as t};