import{u as R,a as F,D as _,E as h,F as w,j as a,I as U,B as T,R as C,L as j,G as M,H as I,J as B}from"./index-LMiUArrL.js";import{b as $,r as A}from"./react-vendor-BQWX9zlF.js";import{x as G,y,_ as H,z as J,F as V,A as X,C as Y,B as x,v as K}from"./firebase-vendor-CzPTl7SW.js";import"./redux-vendor-B8TTZsxA.js";import"./form-vendor-BjD3cHyu.js";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const q="type.googleapis.com/google.protobuf.Int64Value",z="type.googleapis.com/google.protobuf.UInt64Value";function O(e,t){const n={};for(const s in e)e.hasOwnProperty(s)&&(n[s]=t(e[s]));return n}function b(e){if(e==null)return null;if(e instanceof Number&&(e=e.valueOf()),typeof e=="number"&&isFinite(e)||e===!0||e===!1||Object.prototype.toString.call(e)==="[object String]")return e;if(e instanceof Date)return e.toISOString();if(Array.isArray(e))return e.map(t=>b(t));if(typeof e=="function"||typeof e=="object")return O(e,t=>b(t));throw new Error("Data cannot be encoded in JSON: "+e)}function E(e){if(e==null)return e;if(e["@type"])switch(e["@type"]){case q:case z:{const t=Number(e.value);if(isNaN(t))throw new Error("Data cannot be decoded from JSON: "+e);return t}default:throw new Error("Data cannot be decoded from JSON: "+e)}return Array.isArray(e)?e.map(t=>E(t)):typeof e=="function"||typeof e=="object"?O(e,t=>E(t)):e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const v="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const S={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class m extends V{constructor(t,n,s){super(`${v}/${t}`,n||""),this.details=s}}function W(e){if(e>=200&&e<300)return"ok";switch(e){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function Q(e,t){let n=W(e),s=n,r;try{const i=t&&t.error;if(i){const o=i.status;if(typeof o=="string"){if(!S[o])return new m("internal","internal");n=S[o],s=o}const c=i.message;typeof c=="string"&&(s=c),r=i.details,r!==void 0&&(r=E(r))}}catch{}return n==="ok"?null:new m(n,s,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Z{constructor(t,n,s){this.auth=null,this.messaging=null,this.appCheck=null,this.auth=t.getImmediate({optional:!0}),this.messaging=n.getImmediate({optional:!0}),this.auth||t.get().then(r=>this.auth=r,()=>{}),this.messaging||n.get().then(r=>this.messaging=r,()=>{}),this.appCheck||s.get().then(r=>this.appCheck=r,()=>{})}async getAuthToken(){if(this.auth)try{const t=await this.auth.getToken();return t?.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(t){if(this.appCheck){const n=t?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return n.error?null:n.token}return null}async getContext(t){const n=await this.getAuthToken(),s=await this.getMessagingToken(),r=await this.getAppCheckToken(t);return{authToken:n,messagingToken:s,appCheckToken:r}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const k="us-central1";function ee(e){let t=null;return{promise:new Promise((n,s)=>{t=setTimeout(()=>{s(new m("deadline-exceeded","deadline-exceeded"))},e)}),cancel:()=>{t&&clearTimeout(t)}}}class te{constructor(t,n,s,r,i=k,o){this.app=t,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new Z(n,s,r),this.cancelAllRequests=new Promise(c=>{this.deleteService=()=>Promise.resolve(c())});try{const c=new URL(i);this.customDomain=c.origin+(c.pathname==="/"?"":c.pathname),this.region=k}catch{this.customDomain=null,this.region=i}}_delete(){return this.deleteService()}_url(t){const n=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${n}/${this.region}/${t}`:this.customDomain!==null?`${this.customDomain}/${t}`:`https://${this.region}-${n}.cloudfunctions.net/${t}`}}function ne(e,t,n){e.emulatorOrigin=`http://${t}:${n}`}function se(e,t,n){return s=>ie(e,t,s,{})}async function re(e,t,n,s){n["Content-Type"]="application/json";let r;try{r=await s(e,{method:"POST",body:JSON.stringify(t),headers:n})}catch{return{status:0,json:null}}let i=null;try{i=await r.json()}catch{}return{status:r.status,json:i}}function ie(e,t,n,s){const r=e._url(t);return oe(e,r,n,s)}async function oe(e,t,n,s){n=b(n);const r={data:n},i={},o=await e.contextProvider.getContext(s.limitedUseAppCheckTokens);o.authToken&&(i.Authorization="Bearer "+o.authToken),o.messagingToken&&(i["Firebase-Instance-ID-Token"]=o.messagingToken),o.appCheckToken!==null&&(i["X-Firebase-AppCheck"]=o.appCheckToken);const c=s.timeout||7e4,f=ee(c),d=await Promise.race([re(t,r,i,e.fetchImpl),f.promise,e.cancelAllRequests]);if(f.cancel(),!d)throw new m("cancelled","Firebase Functions instance was deleted.");const N=Q(d.status,d.json);if(N)throw N;if(!d.json)throw new m("internal","Response is not valid JSON object.");let l=d.json.data;if(typeof l>"u"&&(l=d.json.result),typeof l>"u")throw new m("internal","Response is missing data field.");return{data:E(l)}}const D="@firebase/functions",P="0.11.8";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ae="auth-internal",ce="app-check-internal",ue="messaging-internal";function le(e,t){const n=(s,{instanceIdentifier:r})=>{const i=s.getProvider("app").getImmediate(),o=s.getProvider(ae),c=s.getProvider(ue),f=s.getProvider(ce);return new te(i,o,c,f,r,e)};X(new Y(v,n,"PUBLIC").setMultipleInstances(!0)),x(D,P,t),x(D,P,"esm2017")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function de(e=G(),t=k){const s=H(y(e),v).getImmediate({identifier:t}),r=J("functions");return r&&pe(s,...r),s}function pe(e,t,n){ne(y(e),t,n)}function fe(e,t,n){return se(y(e),t)}le(fetch.bind(self));const he="_loginPage_2org2_1",ge="_container_2org2_9",me="_panel_2org2_15",Ne="_heading_2org2_23",Ae="_subheading_2org2_28",Ee="_notice_2org2_34",_e="_bootstrapBox_2org2_42",Te="_bootstrapActions_2org2_48",u={loginPage:he,container:ge,panel:me,heading:Ne,subheading:Ae,notice:Ee,bootstrapBox:_e,bootstrapActions:Te},Ce=()=>{const e=$(),t=R(),{user:n,isAdmin:s,adminLoading:r,error:i}=F(l=>l.auth),[o,c]=A.useState(""),[f,d]=A.useState(!1),N=A.useMemo(()=>!!n&&!r&&!s,[n,r,s]);if(A.useEffect(()=>{if(!_){t(h("Firebase не настроен. Пожалуйста, настройте Firebase для работы админ-панели.")),t(w(!1));return}const l=K(_,p=>{t(M(p)),t(w(!1)),p&&(t(I({adminLoading:!0,isAdmin:!1})),B(p).then(g=>{t(I({adminLoading:!1,isAdmin:g})),g?e(C.ADMIN):t(h("У этого аккаунта нет прав администратора."))}))});return()=>l()},[t,e]),n){if(N){const l=async()=>{if(!_){t(h("Firebase не настроен."));return}const p=o.trim();if(!p){t(h("Введите ADMIN_GRANT_SECRET."));return}try{d(!0),t(h(null)),await fe(de(void 0,"us-central1"),"grantAdmin")({bootstrapSecret:p}),t(h("Готово: права выданы. Выйдите и войдите снова, чтобы токен обновился."))}catch(g){const L=g?.code==="functions/permission-denied"?"Секрет неверный или bootstrap уже отключён.":g?.message||"Ошибка при выдаче прав. Проверьте секрет и попробуйте снова.";t(h(L))}finally{d(!1)}};return a.jsx("div",{className:u.loginPage,children:a.jsx("div",{className:u.container,children:a.jsxs("div",{className:u.panel,children:[a.jsx("h2",{className:u.heading,children:"Вход выполнен"}),a.jsx("p",{className:u.subheading,children:"Аккаунт вошёл, но прав администратора пока нет. Если это первый админ — выдайте claim через секрет."}),i&&a.jsx("div",{className:u.notice,children:i}),a.jsxs("div",{className:u.bootstrapBox,children:[a.jsx(U,{label:"ADMIN_GRANT_SECRET (одноразовый)",type:"password",value:o,onChange:p=>c(p.target.value)}),a.jsx(T,{onClick:l,disabled:f,children:f?"Выдача прав…":"Выдать права администратора"})]}),a.jsxs("div",{className:u.bootstrapActions,children:[a.jsx(T,{variant:"secondary",onClick:()=>e(C.HOME),children:"На сайт"}),a.jsx(T,{variant:"secondary",onClick:()=>{window.location.reload()},children:"Обновить"})]})]})})})}return null}return a.jsx("div",{className:u.loginPage,children:a.jsx("div",{className:u.container,children:a.jsx("div",{className:u.panel,children:a.jsx(j,{})})})})};export{Ce as default};
