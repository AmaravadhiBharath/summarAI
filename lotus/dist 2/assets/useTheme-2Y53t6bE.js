import{r as c}from"./index-BW_4U9Iv.js";let q={data:""},G=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||q},X=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,ee=/\/\*[^]*?\*\/|  +/g,z=/\n+/g,w=(e,t)=>{let r="",a="",i="";for(let s in e){let o=e[s];s[0]=="@"?s[1]=="i"?r=s+" "+o+";":a+=s[1]=="f"?w(o,s):s+"{"+w(o,s[1]=="k"?"":t)+"}":typeof o=="object"?a+=w(o,t?t.replace(/([^,])+/g,n=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,l=>/&/.test(l)?l.replace(/&/g,n):n?n+" "+l:l)):s):o!=null&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),i+=w.p?w.p(s,o):s+":"+o+";")}return r+(t&&i?t+"{"+i+"}":i)+a},v={},F=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+F(e[r]);return t}return e},te=(e,t,r,a,i)=>{let s=F(e),o=v[s]||(v[s]=(l=>{let d=0,u=11;for(;d<l.length;)u=101*u+l.charCodeAt(d++)>>>0;return"go"+u})(s));if(!v[o]){let l=s!==e?e:(d=>{let u,m,p=[{}];for(;u=X.exec(d.replace(ee,""));)u[4]?p.shift():u[3]?(m=u[3].replace(z," ").trim(),p.unshift(p[0][m]=p[0][m]||{})):p[0][u[1]]=u[2].replace(z," ").trim();return p[0]})(e);v[o]=w(i?{["@keyframes "+o]:l}:l,r?"":"."+o)}let n=r&&v.g?v.g:null;return r&&(v.g=v[o]),((l,d,u,m)=>{m?d.data=d.data.replace(m,l):d.data.indexOf(l)===-1&&(d.data=u?l+d.data:d.data+l)})(v[o],t,a,n),o},re=(e,t,r)=>e.reduce((a,i,s)=>{let o=t[s];if(o&&o.call){let n=o(r),l=n&&n.props&&n.props.className||/^go/.test(n)&&n;o=l?"."+l:n&&typeof n=="object"?n.props?"":w(n,""):n===!1?"":n}return a+i+(o??"")},"");function O(e){let t=this||{},r=e.call?e(t.p):e;return te(r.unshift?r.raw?re(r,[].slice.call(arguments,1),t.p):r.reduce((a,i)=>Object.assign(a,i&&i.call?i(t.p):i),{}):r,G(t.target),t.g,t.o,t.k)}let M,I,S;O.bind({g:1});let b=O.bind({k:1});function oe(e,t,r,a){w.p=t,M=e,I=r,S=a}function x(e,t){let r=this||{};return function(){let a=arguments;function i(s,o){let n=Object.assign({},s),l=n.className||i.className;r.p=Object.assign({theme:I&&I()},n),r.o=/ *go\d+/.test(l),n.className=O.apply(r,a)+(l?" "+l:"");let d=e;return e[0]&&(d=n.as||e,delete n.as),S&&d[0]&&S(n),M(d,n)}return i}}var ae=e=>typeof e=="function",L=(e,t)=>ae(e)?e(t):e,se=(()=>{let e=0;return()=>(++e).toString()})(),B=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),ie=20,_="default",H=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(o=>o.id===t.toast.id?{...o,...t.toast}:o)};case 2:let{toast:a}=t;return H(e,{type:e.toasts.find(o=>o.id===a.id)?1:0,toast:a});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(o=>o.id===i||i===void 0?{...o,dismissed:!0,visible:!1}:o)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(o=>o.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(o=>({...o,pauseDuration:o.pauseDuration+s}))}}},$=[],K={toasts:[],pausedAt:void 0,settings:{toastLimit:ie}},y={},Z=(e,t=_)=>{y[t]=H(y[t]||K,e),$.forEach(([r,a])=>{r===t&&a(y[t])})},Q=e=>Object.keys(y).forEach(t=>Z(e,t)),ne=e=>Object.keys(y).find(t=>y[t].toasts.some(r=>r.id===e)),U=(e=_)=>t=>{Z(t,e)},le={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},ce=(e={},t=_)=>{let[r,a]=c.useState(y[t]||K),i=c.useRef(y[t]);c.useEffect(()=>(i.current!==y[t]&&a(y[t]),$.push([t,a]),()=>{let o=$.findIndex(([n])=>n===t);o>-1&&$.splice(o,1)}),[t]);let s=r.toasts.map(o=>{var n,l,d;return{...e,...e[o.type],...o,removeDelay:o.removeDelay||((n=e[o.type])==null?void 0:n.removeDelay)||e?.removeDelay,duration:o.duration||((l=e[o.type])==null?void 0:l.duration)||e?.duration||le[o.type],style:{...e.style,...(d=e[o.type])==null?void 0:d.style,...o.style}}});return{...r,toasts:s}},de=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:r?.id||se()}),C=e=>(t,r)=>{let a=de(t,e,r);return U(a.toasterId||ne(a.id))({type:2,toast:a}),a.id},h=(e,t)=>C("blank")(e,t);h.error=C("error");h.success=C("success");h.loading=C("loading");h.custom=C("custom");h.dismiss=(e,t)=>{let r={type:3,toastId:e};t?U(t)(r):Q(r)};h.dismissAll=e=>h.dismiss(void 0,e);h.remove=(e,t)=>{let r={type:4,toastId:e};t?U(t)(r):Q(r)};h.removeAll=e=>h.remove(void 0,e);h.promise=(e,t,r)=>{let a=h.loading(t.loading,{...r,...r?.loading});return typeof e=="function"&&(e=e()),e.then(i=>{let s=t.success?L(t.success,i):void 0;return s?h.success(s,{id:a,...r,...r?.success}):h.dismiss(a),i}).catch(i=>{let s=t.error?L(t.error,i):void 0;s?h.error(s,{id:a,...r,...r?.error}):h.dismiss(a)}),e};var ue=1e3,me=(e,t="default")=>{let{toasts:r,pausedAt:a}=ce(e,t),i=c.useRef(new Map).current,s=c.useCallback((m,p=ue)=>{if(i.has(m))return;let f=setTimeout(()=>{i.delete(m),o({type:4,toastId:m})},p);i.set(m,f)},[]);c.useEffect(()=>{if(a)return;let m=Date.now(),p=r.map(f=>{if(f.duration===1/0)return;let T=(f.duration||0)+f.pauseDuration-(m-f.createdAt);if(T<0){f.visible&&h.dismiss(f.id);return}return setTimeout(()=>h.dismiss(f.id,t),T)});return()=>{p.forEach(f=>f&&clearTimeout(f))}},[r,a,t]);let o=c.useCallback(U(t),[t]),n=c.useCallback(()=>{o({type:5,time:Date.now()})},[o]),l=c.useCallback((m,p)=>{o({type:1,toast:{id:m,height:p}})},[o]),d=c.useCallback(()=>{a&&o({type:6,time:Date.now()})},[a,o]),u=c.useCallback((m,p)=>{let{reverseOrder:f=!1,gutter:T=8,defaultPosition:N}=p||{},j=r.filter(g=>(g.position||N)===(m.position||N)&&g.height),V=j.findIndex(g=>g.id===m.id),P=j.filter((g,D)=>D<V&&g.visible).length;return j.filter(g=>g.visible).slice(...f?[P+1]:[0,P]).reduce((g,D)=>g+(D.height||0)+T,0)},[r]);return c.useEffect(()=>{r.forEach(m=>{if(m.dismissed)s(m.id,m.removeDelay);else{let p=i.get(m.id);p&&(clearTimeout(p),i.delete(m.id))}})},[r,s]),{toasts:r,handlers:{updateHeight:l,startPause:n,endPause:d,calculateOffset:u}}},pe=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,he=b`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,fe=b`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,ge=x("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${pe} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${he} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${fe} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,ye=b`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,ve=x("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${ye} 1s linear infinite;
`,be=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,we=b`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,xe=x("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${be} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${we} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,ke=x("div")`
  position: absolute;
`,Ee=x("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Ce=b`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Te=x("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Ce} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Ae=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return t!==void 0?typeof t=="string"?c.createElement(Te,null,t):t:r==="blank"?null:c.createElement(Ee,null,c.createElement(ve,{...a}),r!=="loading"&&c.createElement(ke,null,r==="error"?c.createElement(ge,{...a}):c.createElement(xe,{...a})))},$e=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Le=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,Oe="0%{opacity:0;} 100%{opacity:1;}",Ue="0%{opacity:1;} 100%{opacity:0;}",je=x("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,De=x("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Ie=(e,t)=>{let r=e.includes("top")?1:-1,[a,i]=B()?[Oe,Ue]:[$e(r),Le(r)];return{animation:t?`${b(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${b(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},Se=c.memo(({toast:e,position:t,style:r,children:a})=>{let i=e.height?Ie(e.position||t||"top-center",e.visible):{opacity:0},s=c.createElement(Ae,{toast:e}),o=c.createElement(De,{...e.ariaProps},L(e.message,e));return c.createElement(je,{className:e.className,style:{...i,...r,...e.style}},typeof a=="function"?a({icon:s,message:o}):c.createElement(c.Fragment,null,s,o))});oe(c.createElement);var _e=({id:e,className:t,style:r,onHeightUpdate:a,children:i})=>{let s=c.useCallback(o=>{if(o){let n=()=>{let l=o.getBoundingClientRect().height;a(e,l)};n(),new MutationObserver(n).observe(o,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return c.createElement("div",{ref:s,className:t,style:r},i)},Ne=(e,t)=>{let r=e.includes("top"),a=r?{top:0}:{bottom:0},i=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:B()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...a,...i}},Pe=O`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,A=16,Je=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:i,toasterId:s,containerStyle:o,containerClassName:n})=>{let{toasts:l,handlers:d}=me(r,s);return c.createElement("div",{"data-rht-toaster":s||"",style:{position:"fixed",zIndex:9999,top:A,left:A,right:A,bottom:A,pointerEvents:"none",...o},className:n,onMouseEnter:d.startPause,onMouseLeave:d.endPause},l.map(u=>{let m=u.position||t,p=d.calculateOffset(u,{reverseOrder:e,gutter:a,defaultPosition:t}),f=Ne(m,p);return c.createElement(_e,{id:u.id,key:u.id,onHeightUpdate:d.updateHeight,className:u.visible?Pe:"",style:f},u.type==="custom"?L(u.message,u):i?i(u):c.createElement(Se,{toast:u,position:m}))}))},ze=h;let k=null;const E=[],Re=e=>new Promise((t,r)=>{chrome.identity.getAuthToken({interactive:e},a=>{chrome.runtime.lastError?r(chrome.runtime.lastError):a&&typeof a=="string"?t(a):a&&typeof a=="object"&&"token"in a?t(a.token):r(new Error("No token received"))})}),Fe=async e=>{const t=await fetch("https://www.googleapis.com/oauth2/v2/userinfo",{headers:{Authorization:`Bearer ${e}`}});if(!t.ok)throw new Error("Failed to get user info");const r=await t.json();return{email:r.email,id:r.id,name:r.name,picture:r.picture}},Ve=async()=>{try{await W();const e=await Re(!0),t=await Fe(e);return k=t,E.forEach(r=>r(t)),await chrome.storage.local.set({chromeUser:t,authToken:e}),t}catch(e){throw console.error("Error signing in with Google",e),ze.error("Sign In Error: "+(e.message||e)),e}},qe=async()=>{try{await W(),k=null,E.forEach(e=>e(null)),await chrome.storage.local.remove(["chromeUser","authToken"])}catch(e){console.error("Error signing out",e)}},W=async()=>new Promise(e=>{chrome.identity.getAuthToken({interactive:!1},t=>{const r=typeof t=="string"?t:t?.token;r?chrome.identity.removeCachedAuthToken({token:r},()=>e()):e()})}),Ge=e=>{E.push(e),chrome.storage.local.get(["chromeUser"],r=>{r.chromeUser?(k=r.chromeUser,e(k)):e(null)});const t=(r,a)=>{a==="local"&&r.chromeUser&&(k=r.chromeUser.newValue||null,e(k))};return chrome.storage.onChanged.addListener(t),()=>{const r=E.indexOf(e);r>-1&&E.splice(r,1),chrome.storage.onChanged.removeListener(t)}},Y="https://script.google.com/macros/s/AKfycbyeohAlB3zqDoIK1Qtr2K9zClnsIaRxTrDv7k2bx_scTvCJ_F-_KYAZLESl8t8YA8gTEg/exec",Xe=async e=>{try{if((await chrome.storage.local.get(["userTrackedEmail"])).userTrackedEmail===e.email)return;await fetch(Y,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"user_signup",name:e.name||"Unknown",email:e.email})}),await chrome.storage.local.set({userTrackedEmail:e.email}),console.log("User tracked in DB")}catch(t){console.error("Failed to track user",t)}},et=async(e,t)=>{try{await fetch(Y,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"heavy_user",name:"Heavy User",email:e,count:t})})}catch(r){console.error("Failed to track heavy user",r)}};const Me=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Be=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,a)=>a?a.toUpperCase():r.toLowerCase()),R=e=>{const t=Be(e);return t.charAt(0).toUpperCase()+t.slice(1)},J=(...e)=>e.filter((t,r,a)=>!!t&&t.trim()!==""&&a.indexOf(t)===r).join(" ").trim(),He=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};var Ke={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};const Ze=c.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:a,className:i="",children:s,iconNode:o,...n},l)=>c.createElement("svg",{ref:l,...Ke,width:t,height:t,stroke:e,strokeWidth:a?Number(r)*24/Number(t):r,className:J("lucide",i),...!s&&!He(n)&&{"aria-hidden":"true"},...n},[...o.map(([d,u])=>c.createElement(d,u)),...Array.isArray(s)?s:[s]]));const Qe=(e,t)=>{const r=c.forwardRef(({className:a,...i},s)=>c.createElement(Ze,{ref:s,iconNode:t,className:J(`lucide-${Me(R(e))}`,`lucide-${e}`,a),...i}));return r.displayName=R(e),r};const We=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],tt=Qe("check",We);function rt(){const[e,t]=c.useState("auto"),[r,a]=c.useState("light");c.useEffect(()=>{chrome.storage.local.get(["theme"],d=>{const u=d.theme||"auto";t(u)});const o=d=>{d.theme&&t(d.theme.newValue)};chrome.storage.onChanged.addListener(o);const n=window.matchMedia("(prefers-color-scheme: dark)"),l=d=>{i(e,d.matches)};return n.addEventListener("change",l),l(n),()=>{n.removeEventListener("change",l),chrome.storage.onChanged.removeListener(o)}},[]),c.useEffect(()=>{const o=window.matchMedia("(prefers-color-scheme: dark)");i(e,o.matches)},[e]);const i=(o,n)=>{let l;o==="auto"?l=n?"dark":"light":l=o,a(l),document.documentElement.setAttribute("data-theme",l)};return{theme:e,resolvedTheme:r,setTheme:o=>{t(o),chrome.storage.local.set({theme:o})}}}export{tt as C,Je as F,Ve as a,et as b,Qe as c,qe as l,h as n,Ge as s,Xe as t,rt as u,ze as z};
