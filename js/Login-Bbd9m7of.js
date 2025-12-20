import{u as F,a as U,D as T,E as h,F as C,j as a,I as j,B as b,R as k,L as M,G as B,H as S,J as $}from"./index-qexVuyB5.js";import{b as G,r as E}from"./react-vendor-BQWX9zlF.js";import{x as H,y as w,_ as J,z as V,F as X,A as Y,C as K,B as x,v as q}from"./firebase-vendor-CzPTl7SW.js";import"./redux-vendor-B8TTZsxA.js";import"./form-vendor-BjD3cHyu.js";/**
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
 */const z="type.googleapis.com/google.protobuf.Int64Value",W="type.googleapis.com/google.protobuf.UInt64Value";function L(e,t){const n={};for(const s in e)e.hasOwnProperty(s)&&(n[s]=t(e[s]));return n}function y(e){if(e==null)return null;if(e instanceof Number&&(e=e.valueOf()),typeof e=="number"&&isFinite(e)||e===!0||e===!1||Object.prototype.toString.call(e)==="[object String]")return e;if(e instanceof Date)return e.toISOString();if(Array.isArray(e))return e.map(t=>y(t));if(typeof e=="function"||typeof e=="object")return L(e,t=>y(t));throw new Error("Data cannot be encoded in JSON: "+e)}function _(e){if(e==null)return e;if(e["@type"])switch(e["@type"]){case z:case W:{const t=Number(e.value);if(isNaN(t))throw new Error("Data cannot be decoded from JSON: "+e);return t}default:throw new Error("Data cannot be decoded from JSON: "+e)}return Array.isArray(e)?e.map(t=>_(t)):typeof e=="function"||typeof e=="object"?L(e,t=>_(t)):e}/**
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
 */const I="functions";/**
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
 */const D={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class N extends X{constructor(t,n,s){super(`${I}/${t}`,n||""),this.details=s}}function Q(e){if(e>=200&&e<300)return"ok";switch(e){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function Z(e,t){let n=Q(e),s=n,r;try{const i=t&&t.error;if(i){const o=i.status;if(typeof o=="string"){if(!D[o])return new N("internal","internal");n=D[o],s=o}const c=i.message;typeof c=="string"&&(s=c),r=i.details,r!==void 0&&(r=_(r))}}catch{}return n==="ok"?null:new N(n,s,r)}/**
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
 */class ee{constructor(t,n,s){this.auth=null,this.messaging=null,this.appCheck=null,this.auth=t.getImmediate({optional:!0}),this.messaging=n.getImmediate({optional:!0}),this.auth||t.get().then(r=>this.auth=r,()=>{}),this.messaging||n.get().then(r=>this.messaging=r,()=>{}),this.appCheck||s.get().then(r=>this.appCheck=r,()=>{})}async getAuthToken(){if(this.auth)try{const t=await this.auth.getToken();return t?.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(t){if(this.appCheck){const n=t?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return n.error?null:n.token}return null}async getContext(t){const n=await this.getAuthToken(),s=await this.getMessagingToken(),r=await this.getAppCheckToken(t);return{authToken:n,messagingToken:s,appCheckToken:r}}}/**
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
 */const v="us-central1";function te(e){let t=null;return{promise:new Promise((n,s)=>{t=setTimeout(()=>{s(new N("deadline-exceeded","deadline-exceeded"))},e)}),cancel:()=>{t&&clearTimeout(t)}}}class ne{constructor(t,n,s,r,i=v,o){this.app=t,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new ee(n,s,r),this.cancelAllRequests=new Promise(c=>{this.deleteService=()=>Promise.resolve(c())});try{const c=new URL(i);this.customDomain=c.origin+(c.pathname==="/"?"":c.pathname),this.region=v}catch{this.customDomain=null,this.region=i}}_delete(){return this.deleteService()}_url(t){const n=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${n}/${this.region}/${t}`:this.customDomain!==null?`${this.customDomain}/${t}`:`https://${this.region}-${n}.cloudfunctions.net/${t}`}}function se(e,t,n){e.emulatorOrigin=`http://${t}:${n}`}function re(e,t,n){return s=>oe(e,t,s,{})}async function ie(e,t,n,s){n["Content-Type"]="application/json";let r;try{r=await s(e,{method:"POST",body:JSON.stringify(t),headers:n})}catch{return{status:0,json:null}}let i=null;try{i=await r.json()}catch{}return{status:r.status,json:i}}function oe(e,t,n,s){const r=e._url(t);return ae(e,r,n,s)}async function ae(e,t,n,s){n=y(n);const r={data:n},i={},o=await e.contextProvider.getContext(s.limitedUseAppCheckTokens);o.authToken&&(i.Authorization="Bearer "+o.authToken),o.messagingToken&&(i["Firebase-Instance-ID-Token"]=o.messagingToken),o.appCheckToken!==null&&(i["X-Firebase-AppCheck"]=o.appCheckToken);const c=s.timeout||7e4,p=te(c),l=await Promise.race([ie(t,r,i,e.fetchImpl),p.promise,e.cancelAllRequests]);if(p.cancel(),!l)throw new N("cancelled","Firebase Functions instance was deleted.");const A=Z(l.status,l.json);if(A)throw A;if(!l.json)throw new N("internal","Response is not valid JSON object.");let f=l.json.data;if(typeof f>"u"&&(f=l.json.result),typeof f>"u")throw new N("internal","Response is missing data field.");return{data:_(f)}}const P="@firebase/functions",O="0.11.8";/**
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
 */const ce="auth-internal",ue="app-check-internal",le="messaging-internal";function de(e,t){const n=(s,{instanceIdentifier:r})=>{const i=s.getProvider("app").getImmediate(),o=s.getProvider(ce),c=s.getProvider(le),p=s.getProvider(ue);return new ne(i,o,c,p,r,e)};Y(new K(I,n,"PUBLIC").setMultipleInstances(!0)),x(P,O,t),x(P,O,"esm2017")}/**
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
 */function pe(e=H(),t=v){const s=J(w(e),I).getImmediate({identifier:t}),r=V("functions");return r&&he(s,...r),s}function he(e,t,n){se(w(e),t,n)}function fe(e,t,n){return re(w(e),t)}de(fetch.bind(self));const ge="_loginPage_2org2_1",me="_container_2org2_9",Ne="_panel_2org2_15",Ae="_heading_2org2_23",Ee="_subheading_2org2_28",_e="_notice_2org2_34",Te="_bootstrapBox_2org2_42",be="_bootstrapActions_2org2_48",u={loginPage:ge,container:me,panel:Ne,heading:Ae,subheading:Ee,notice:_e,bootstrapBox:Te,bootstrapActions:be},Ce=()=>{const e=G(),t=F(),{user:n,isAdmin:s,adminLoading:r,error:i}=U(g=>g.auth),[o,c]=E.useState(""),[p,l]=E.useState(!1),A=E.useMemo(()=>!!n&&!r&&!s,[n,r,s]);if(E.useEffect(()=>{if(!T){t(h("Firebase не настроен. Пожалуйста, настройте Firebase для работы админ-панели.")),t(C(!1));return}const g=q(T,d=>{t(B(d)),t(C(!1)),d&&(t(S({adminLoading:!0,isAdmin:!1})),$(d).then(m=>{t(S({adminLoading:!1,isAdmin:m})),m?e(k.ADMIN):t(h("У этого аккаунта нет прав администратора."))}))});return()=>g()},[t,e]),n){if(A){const g=async()=>{if(!T){t(h("Firebase не настроен."));return}const d=o.trim();if(!d){t(h("Введите ADMIN_GRANT_SECRET."));return}try{l(!0),t(h(null)),await fe(pe(void 0,"us-central1"),"grantAdmin")({bootstrapSecret:d}),t(h("Готово: права выданы. Выйдите и войдите снова, чтобы токен обновился."))}catch(m){const R=m?.code==="functions/permission-denied"?"Секрет неверный или bootstrap уже отключён.":m?.message||"Ошибка при выдаче прав. Проверьте секрет и попробуйте снова.";t(h(R))}finally{l(!1)}};return a.jsx("div",{className:u.loginPage,children:a.jsx("div",{className:u.container,children:a.jsxs("div",{className:u.panel,children:[a.jsx("h2",{className:u.heading,children:"Вход выполнен"}),a.jsx("p",{className:u.subheading,children:"Аккаунт вошёл, но прав администратора пока нет. Если это первый админ — выдайте claim через секрет."}),i&&a.jsx("div",{className:u.notice,children:i}),a.jsxs("div",{className:u.bootstrapBox,children:[a.jsx(j,{label:"ADMIN_GRANT_SECRET (одноразовый)",type:"password",value:o,onChange:d=>c(d.target.value)}),a.jsx(b,{onClick:g,disabled:p,children:p?"Выдача прав…":"Выдать права администратора"})]}),a.jsxs("div",{className:u.bootstrapActions,children:[a.jsx(b,{variant:"secondary",onClick:()=>e(k.HOME),children:"На сайт"}),a.jsx(b,{variant:"secondary",onClick:()=>{window.location.reload()},children:"Обновить"})]})]})})})}return null}const f=()=>{e(k.ADMIN)};return a.jsx("div",{className:u.loginPage,children:a.jsx("div",{className:u.container,children:a.jsx("div",{className:u.panel,children:a.jsx(M,{onSuccess:f})})})})};export{Ce as default};
