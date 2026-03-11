import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, Line, ComposedChart, Legend,
} from "recharts";
import Warehouse3D from "./Warehouse3D";

/*
╔═══════════════════════════════════════════════════════════════════════════╗
║  DISTRILOGIK LAX 3PL — Warehouse Management + Floor Tracking            ║
║  React + Supabase · Weekly Records · On-Shelf vs On-Floor Analytics     ║
╚═══════════════════════════════════════════════════════════════════════════╝
*/

// ═══════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════
const SHELVES = [
  {id:1,name:"S01",type:"SD",cap:342,fMax:180,bMax:12,kMax:150},
  {id:2,name:"S02",type:"SD",cap:342,fMax:180,bMax:12,kMax:150},
  {id:3,name:"S03",type:"SD",cap:342,fMax:180,bMax:12,kMax:150},
  {id:4,name:"S04",type:"SD",cap:309,fMax:180,bMax:12,kMax:117},
  {id:5,name:"S05",type:"SD",cap:315,fMax:180,bMax:12,kMax:123},
  {id:6,name:"S06",type:"SD",cap:297,fMax:180,bMax:12,kMax:105},
  {id:7,name:"S07",type:"SD",cap:297,fMax:180,bMax:12,kMax:105},
  {id:8,name:"S08",type:"SD",cap:297,fMax:180,bMax:12,kMax:105},
  {id:9,name:"S09",type:"SD",cap:279,fMax:180,bMax:12,kMax:87},
  {id:10,name:"S10",type:"SD",cap:309,fMax:180,bMax:12,kMax:117},
  {id:11,name:"S11",type:"SD",cap:309,fMax:180,bMax:12,kMax:117},
  {id:12,name:"S12",type:"SD",cap:309,fMax:180,bMax:12,kMax:117},
  {id:13,name:"S13",type:"SD",cap:309,fMax:180,bMax:12,kMax:117},
  {id:14,name:"S14",type:"SD",cap:354,fMax:180,bMax:12,kMax:162},
  {id:15,name:"S15",type:"SD",cap:309,fMax:180,bMax:12,kMax:117},
  {id:16,name:"S16",type:"SD",cap:309,fMax:180,bMax:12,kMax:117},
  {id:17,name:"S17",type:"DD",cap:708,fMax:360,bMax:24,kMax:324},
  {id:18,name:"S18",type:"DD",cap:708,fMax:360,bMax:24,kMax:324},
  {id:19,name:"S19",type:"DD",cap:708,fMax:360,bMax:24,kMax:324},
  {id:20,name:"S20",type:"DD",cap:708,fMax:360,bMax:24,kMax:324},
  {id:21,name:"S21",type:"DD",cap:708,fMax:360,bMax:24,kMax:324},
  {id:22,name:"S22",type:"DD",cap:708,fMax:360,bMax:24,kMax:324},
  {id:23,name:"S23",type:"DD",cap:708,fMax:360,bMax:24,kMax:324},
  {id:24,name:"S24",type:"DD",cap:708,fMax:360,bMax:24,kMax:324},
  {id:25,name:"S25",type:"DD",cap:708,fMax:360,bMax:24,kMax:324},
  {id:26,name:"S26",type:"SD",cap:348,fMax:180,bMax:12,kMax:156},
];
const TOTAL_CAP = SHELVES.reduce((a,s)=>a+s.cap,0);

// ═══════════════════════════════════════════════════
//  SUPABASE
// ═══════════════════════════════════════════════════
const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://phrzbqzrlrykcpycajhp.supabase.co";
const SB_KEY = import.meta.env.VITE_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocnpicXpybHJ5a2NweWNhamhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Mzc5ODAsImV4cCI6MjA4ODUxMzk4MH0.GbWBCOeU6jX2dDAMWtAIpFgErvGUOoJpXxRBJsKWY6w";
const supabase = createClient(SB_URL, SB_KEY);

// ═══════════════════════════════════════════════════
//  THEME
// ═══════════════════════════════════════════════════
const C = {
  bg:"#fef9f3",card:"#faf5ef",border:"#e8ddd0",
  accent:"#6495ed",accentDim:"rgba(100,149,237,0.12)",
  orange:"#ff8c00",orangeDim:"rgba(255,140,0,0.12)",
  green:"#7ccd7c",greenDim:"rgba(124,205,124,0.12)",
  yellow:"#ffd700",yellowDim:"rgba(255,215,0,0.12)",
  red:"#c41e3a",redDim:"rgba(196,30,58,0.12)",
  floor:"#ff6b9d",floorDim:"rgba(255,107,157,0.12)",
  purple:"#9370db",cyan:"#20b2aa",
  text:"#3a3a3a",dim:"#8b8b8b",mid:"#5c5c5c",grid:"#ddd5ca",
};

const ACCT_COLORS = ["#ff6b9d","#6495ed","#ff8c00","#7ccd7c","#9370db","#20b2aa"];

// ═══════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════
function weekNow() {
  const d=new Date(),j=new Date(d.getFullYear(),0,1);
  return `${d.getFullYear()}-W${String(Math.ceil(((d-j)/864e5+j.getDay()+1)/7)).padStart(2,"0")}`;
}
function weekOpts() {
  const w=[],d=new Date();
  for(let i=0;i<52;i++){const x=new Date(d);x.setDate(x.getDate()-i*7);const j=new Date(x.getFullYear(),0,1);w.push(`${x.getFullYear()}-W${String(Math.ceil(((x-j)/864e5+j.getDay()+1)/7)).padStart(2,"0")}`);}
  return [...new Set(w)];
}

const CTip = ({active,payload,label})=>{
  if(!active||!payload?.length) return null;
  return (<div style={{background:"rgba(4,7,12,0.97)",border:`1px solid ${C.accent}`,padding:"9px 13px",fontSize:10,fontFamily:"monospace",boxShadow:`0 0 20px ${C.accentDim}`}}>
    <div style={{color:C.accent,fontWeight:700,marginBottom:4}}>{label}</div>
    {payload.map((p,i)=>(<div key={i} style={{color:p.color||C.text,marginBottom:1}}>{p.name}: <b>{typeof p.value==="number"?p.value.toLocaleString():p.value}</b></div>))}
  </div>);
};

// ═══════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("input");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputs, setInputs] = useState(()=>{const o={};SHELVES.forEach(s=>{o[s.id]=""});return o;});
  const [floorAccounts, setFloorAccounts] = useState([
    {name:"",value:""},
  ]);
  const floorPallets = floorAccounts.reduce((sum,a)=>sum+(parseInt(a.value)||0),0);
  const [data, setData] = useState(()=>SHELVES.map(s=>({...s,fE:0,bE:0,kE:0,occ:s.cap,free:0,util:100})));
  const [snaps, setSnaps] = useState([]);
  const [log, setLog] = useState([]);
  const [notif, setNotif] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewReportDate, setViewReportDate] = useState(null);
  const [viewReportRecords, setViewReportRecords] = useState([]);
  const [viewAnalyticsDate, setViewAnalyticsDate] = useState(null);
  const [viewAnalyticsSnapshot, setViewAnalyticsSnapshot] = useState(null);

  useEffect(()=>{loadSnaps();},[]);

  async function loadSnaps() {
    const { data: rows, error } = await supabase
      .from("weekly_snapshots")
      .select("*")
      .order("week_label", { ascending: true })
      .limit(52);

    if (rows && rows.length > 0) {
      setSnaps(rows);
    } else {
      // Demo data with floor pallets
      const demo=[],now=new Date();
      for(let i=15;i>=0;i--){
        const d=new Date(now);d.setDate(d.getDate()-i*7);
        const j=new Date(d.getFullYear(),0,1);
        const wn=Math.ceil(((d-j)/864e5+j.getDay()+1)/7);
        const wk=`${d.getFullYear()}-W${String(wn).padStart(2,"0")}`;
        const occ=Math.round(TOTAL_CAP*(0.70+Math.random()*0.20));
        const free=TOTAL_CAP-occ;
        const fp=Math.round(50+Math.random()*200);
        demo.push({week_label:wk,total_capacity:TOTAL_CAP,total_occupied:occ,total_free:free,
          utilization_pct:+((occ/TOTAL_CAP)*100).toFixed(1),
          sd_occupied:Math.round(occ*0.41),dd_occupied:Math.round(occ*0.59),
          sd_free:Math.round(free*0.44),dd_free:Math.round(free*0.56),
          floor_pallets:fp,on_shelf_total:occ,
          critical_shelves:Math.floor(Math.random()*3),
          high_shelves:Math.floor(Math.random()*8)+2,
          optimal_shelves:Math.floor(Math.random()*10)+6,
          low_shelves:Math.floor(Math.random()*5),
        });
      }
      setSnaps(demo);
    }
  }

  const notify=(m,t="success")=>{setNotif({m,t});setTimeout(()=>setNotif(null),3500);};

  async function loadHistoricalReport(date) {
    const { data: records, error } = await supabase
      .from("weekly_records")
      .select("*")
      .eq("week_label", `${date} (${new Date(date).toLocaleDateString('en-US', {weekday:'short'})})`)
      .order("shelf_id", { ascending: true });

    if (records && records.length > 0) {
      setViewReportDate(date);
      setViewReportRecords(records);
      notify(`Loaded report for ${date}`, "info");
    } else {
      notify("No records found for this date", "error");
    }
  }

  async function loadHistoricalAnalytics(date) {
    const { data: snapshot, error } = await supabase
      .from("weekly_snapshots")
      .select("*")
      .eq("week_label", `${date} (${new Date(date).toLocaleDateString('en-US', {weekday:'short'})})`)
      .single();

    if (snapshot) {
      setViewAnalyticsDate(date);
      setViewAnalyticsSnapshot(snapshot);
      notify(`Loaded analytics for ${date}`, "info");
    } else {
      notify("No analytics found for this date", "error");
    }
  }

  function apply() {
    const fp = floorPallets;
    const nd = SHELVES.map(s=>{
      const inp=inputs[s.id]?.trim();
      let fE=0,bE=0,kE=0;
      if(inp){const p=inp.split("-").map(Number);if(p.length===3&&p.every(n=>!isNaN(n))){fE=Math.min(p[0],s.fMax);bE=Math.min(p[1],s.bMax);kE=Math.min(p[2],s.kMax);}}
      const te=fE+bE+kE;
      return{...s,fE,bE,kE,occ:s.cap-te,free:te,util:+((1-te/s.cap)*100).toFixed(1)};
    });
    setData(nd);return{nd,fp};
  }

  async function saveWeek() {
    setSaving(true);
    setShowConfirm(false);
    const{nd,fp}=apply();
    const tOcc=nd.reduce((a,s)=>a+s.occ,0),tFree=nd.reduce((a,s)=>a+s.free,0);
    const util=+((tOcc/TOTAL_CAP)*100).toFixed(1);
    const sdD=nd.filter(s=>s.type==="SD"),ddD=nd.filter(s=>s.type==="DD");

    // Use the record date for the week label
    const week_label = `${recordDate} (${new Date(recordDate).toLocaleDateString('en-US', {weekday:'short'})})`;

    const snap={
      week_label,total_capacity:TOTAL_CAP,total_occupied:tOcc,total_free:tFree,utilization_pct:util,
      sd_occupied:sdD.reduce((a,s)=>a+s.occ,0),dd_occupied:ddD.reduce((a,s)=>a+s.occ,0),
      sd_free:sdD.reduce((a,s)=>a+s.free,0),dd_free:ddD.reduce((a,s)=>a+s.free,0),
      floor_pallets:fp,on_shelf_total:tOcc,
      critical_shelves:nd.filter(s=>s.util>90).length,
      high_shelves:nd.filter(s=>s.util>70&&s.util<=90).length,
      optimal_shelves:nd.filter(s=>s.util>40&&s.util<=70).length,
      low_shelves:nd.filter(s=>s.util<=40).length,
    };

    const { error: snapErr } = await supabase
      .from("weekly_snapshots")
      .upsert(snap, { onConflict: "week_label" });

    if (snapErr) {
      console.error("Snapshot save error:", snapErr);
      notify("Error saving to Supabase", "error");
    }

    const recs = nd.filter(s=>inputs[s.id]?.trim()).map(s=>({
      week_label, shelf_id:s.id, front_empties:s.fE,
      bridge_empties:s.bE, back_empties:s.kE,
      occupied:s.occ, free:s.free, utilization_pct:s.util
    }));
    if (recs.length) {
      await supabase.from("weekly_records").insert(recs);
    }

    await loadSnaps();
    setLog(p=>[{t:new Date().toLocaleTimeString(),w:week_label,occ:tOcc,free:tFree,u:util,fp},...p]);
    notify(`✓ ${recordDate} saved — ${tOcc.toLocaleString()} on shelf · ${fp} on floor · ${util}% util`);
    setSaving(false);
  }

  // ── Analytics ──
  const A = useMemo(()=>{
    const tOcc=data.reduce((a,s)=>a+s.occ,0),tFree=data.reduce((a,s)=>a+s.free,0);
    const util=TOTAL_CAP?(tOcc/TOTAL_CAP*100).toFixed(1):0;
    const sd=data.filter(s=>s.type==="SD"),dd=data.filter(s=>s.type==="DD");
    const sdOcc=sd.reduce((a,s)=>a+s.occ,0),ddOcc=dd.reduce((a,s)=>a+s.occ,0);
    const sdCap=sd.reduce((a,s)=>a+s.cap,0),ddCap=dd.reduce((a,s)=>a+s.cap,0);
    const hot=[...data].sort((a,b)=>b.util-a.util).slice(0,5);
    const cold=[...data].sort((a,b)=>a.util-b.util).slice(0,5);
    const totalWithFloor=tOcc+floorPallets;
    const floorPct=totalWithFloor?(floorPallets/totalWithFloor*100).toFixed(1):0;
    const shelfPct=totalWithFloor?(tOcc/totalWithFloor*100).toFixed(1):0;
    return{tOcc,tFree,util:+util,sd,dd,sdOcc,ddOcc,sdCap,ddCap,hot,cold,totalWithFloor,floorPct:+floorPct,shelfPct:+shelfPct};
  },[data,floorPallets]);

  const wowDelta = useMemo(()=>{
    if(snaps.length<2)return null;
    const l=snaps[snaps.length-1],p=snaps[snaps.length-2];
    return{util:+(l.utilization_pct-p.utilization_pct).toFixed(1),floor:(l.floor_pallets||0)-(p.floor_pallets||0)};
  },[snaps]);

  // ── Styles ──
  const card={background:C.card,border:`1px solid ${C.border}`,borderRadius:4,padding:18};
  const lbl={fontFamily:"monospace",fontSize:9,letterSpacing:3,color:C.dim,textTransform:"uppercase",marginBottom:10,borderBottom:`1px solid ${C.border}`,paddingBottom:7};

  // ═══════════════════════════════════════════════════
  //  INPUT PAGE
  // ═══════════════════════════════════════════════════
  const renderInput = () => (
    <div style={{padding:"20px 28px",maxWidth:1500,margin:"0 auto"}}>
      {/* Controls bar */}
      <div style={{display:"flex",gap:10,alignItems:"flex-end",marginBottom:20,flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:"monospace",fontSize:8,letterSpacing:2,color:C.dim,marginBottom:3}}>RECORD DATE</div>
          <input type="date" value={recordDate} onChange={e=>setRecordDate(e.target.value)} style={{background:C.card,border:`1px solid ${C.border}`,color:C.accent,padding:"8px 12px",fontSize:12,fontFamily:"monospace",borderRadius:3}}/>
        </div>

        <Btn c={C.accent} onClick={()=>{apply();notify("Preview updated","info")}}>PREVIEW</Btn>
        <Btn c={C.green} filled onClick={()=>setShowConfirm(true)} disabled={saving}>{saving?"SAVING...":"SAVE WEEK"}</Btn>
        <Btn c={C.red} onClick={()=>{
          const o={};SHELVES.forEach(s=>{o[s.id]=""});setInputs(o);
          setFloorAccounts([{name:"",value:""}]);
          setData(SHELVES.map(s=>({...s,fE:0,bE:0,kE:0,occ:s.cap,free:0,util:100})));
          notify("Reset to full","info");
        }}>CLEAR</Btn>
      </div>

      {/* Floor pallets by account */}
      <div style={{...card,marginBottom:16,padding:"14px 18px"}}>
        <div style={{...lbl,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>FLOOR PALLETS BY ACCOUNT</span>
          <button onClick={()=>setFloorAccounts(p=>[...p,{name:"",value:""}])}
            style={{background:C.accentDim,border:`1px solid ${C.accent}44`,color:C.accent,padding:"4px 12px",fontSize:9,fontWeight:700,letterSpacing:1,cursor:"pointer",fontFamily:"monospace",borderRadius:3}}>+ ADD ACCOUNT</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {floorAccounts.map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:4,height:34,borderRadius:2,background:ACCT_COLORS[i%ACCT_COLORS.length],flexShrink:0}}/>
              <input type="text" placeholder="Account name" value={a.name}
                onChange={e=>{const v=e.target.value;setFloorAccounts(p=>p.map((x,j)=>j===i?{...x,name:v}:x));}}
                style={{background:C.bg,border:`1px solid ${C.border}`,color:C.text,padding:"7px 10px",fontSize:11,fontWeight:600,fontFamily:"monospace",borderRadius:3,width:180,outline:"none"}}/>
              <input type="number" min="0" placeholder="Pallets" value={a.value}
                onChange={e=>{const v=e.target.value;setFloorAccounts(p=>p.map((x,j)=>j===i?{...x,value:v}:x));}}
                onKeyDown={e=>{if(e.key==="Enter")apply();}}
                style={{background:C.bg,border:`1px solid ${C.border}`,color:ACCT_COLORS[i%ACCT_COLORS.length],padding:"7px 10px",fontSize:13,fontWeight:700,fontFamily:"monospace",borderRadius:3,width:100,outline:"none"}}/>
              {floorAccounts.length>1&&(
                <button onClick={()=>setFloorAccounts(p=>p.filter((_,j)=>j!==i))}
                  style={{background:C.redDim,border:`1px solid ${C.red}33`,color:C.red,width:28,height:28,fontSize:14,fontWeight:700,cursor:"pointer",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1}}>×</button>
              )}
            </div>
          ))}
        </div>
        {floorPallets > 0 && (
          <div style={{marginTop:12,padding:"10px 14px",background:C.floorDim,border:`1px solid ${C.floor}33`,borderRadius:4,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <div style={{fontSize:28,fontWeight:900,color:C.floor,fontFamily:"monospace",lineHeight:1}}>{floorPallets}</div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.floor}}>TOTAL PALLETS ON FLOOR</div>
              <div style={{fontSize:9,color:C.mid}}>{A.floorPct}% of total inventory · {floorAccounts.filter(a=>parseInt(a.value)>0).length} active accounts</div>
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
              {floorAccounts.filter(a=>parseInt(a.value)>0).map((a,i)=>{
                const origIdx=floorAccounts.indexOf(a);
                return(<div key={i} style={{fontSize:9,fontFamily:"monospace",color:ACCT_COLORS[origIdx%ACCT_COLORS.length],background:`${ACCT_COLORS[origIdx%ACCT_COLORS.length]}15`,border:`1px solid ${ACCT_COLORS[origIdx%ACCT_COLORS.length]}33`,padding:"3px 8px",borderRadius:3}}>
                  {a.name||`Account ${origIdx+1}`}: <b>{a.value}</b>
                </div>);
              })}
            </div>
          </div>
        )}
      </div>

      <div style={lbl}>SHELF EMPTIES · FORMAT: FRONT-BRIDGE-BACK (e.g. 46-3-25) · ALL RACKS START FULL</div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:5}}>
        {SHELVES.map(s=>{
          const d=data.find(x=>x.id===s.id)||s;
          const bc=d.util>90?C.red:d.util>70?C.orange:d.util>40?C.yellow:C.green;
          const tc=s.type==="DD"?C.yellow:C.accent;
          return(
            <div key={s.id} style={{...card,padding:"9px 13px",display:"flex",alignItems:"center",gap:9}}>
              <div style={{minWidth:46}}>
                <div style={{fontSize:16,fontWeight:800,color:tc,letterSpacing:2,fontFamily:"monospace"}}>{s.name}</div>
                <div style={{fontSize:7,color:C.dim,letterSpacing:2,fontFamily:"monospace"}}>{s.type}·{s.cap}</div>
              </div>
              <div style={{flex:"0 0 52px"}}>
                <div style={{width:52,height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
                  <div style={{width:`${d.util}%`,height:"100%",background:bc,borderRadius:2,transition:"width 0.4s"}}/>
                </div>
                <div style={{fontSize:9,fontWeight:700,color:bc,marginTop:2,textAlign:"center",fontFamily:"monospace"}}>{d.util}%</div>
              </div>
              <div style={{fontSize:7,fontFamily:"monospace",color:C.dim,flex:"0 0 78px",lineHeight:1.6}}>
                <span style={{color:C.accent}}>F:{s.fMax}</span> <span style={{color:C.yellow}}>B:{s.bMax}</span> <span style={{color:C.text}}>K:{s.kMax}</span>
              </div>
              <input type="text" placeholder="46-3-25" value={inputs[s.id]}
                onChange={e=>setInputs(p=>({...p,[s.id]:e.target.value}))}
                onKeyDown={e=>{if(e.key==="Enter")apply();}}
                style={{flex:1,background:"rgba(0,0,0,0.3)",border:`1px solid ${C.border}`,color:C.text,padding:"6px 9px",fontSize:11,fontFamily:"monospace",borderRadius:3,outline:"none",minWidth:65}}/>
            </div>
          );
        })}
      </div>

      {log.length>0&&(
        <div style={{marginTop:20}}>
          <div style={lbl}>SESSION LOG</div>
          <div style={{...card,maxHeight:140,overflowY:"auto"}}>
            {log.map((h,i)=>(<div key={i} style={{fontSize:10,fontFamily:"monospace",color:C.mid,marginBottom:2,display:"flex",gap:12}}>
              <span style={{color:C.dim}}>{h.t}</span><span style={{color:C.accent}}>{h.w}</span>
              <span>Shelf:{h.occ.toLocaleString()}</span><span style={{color:C.floor}}>Floor:{h.fp}</span>
              <span style={{color:C.green}}>Free:{h.free.toLocaleString()}</span><span style={{color:C.yellow}}>{h.u}%</span>
            </div>))}
          </div>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════
  //  ANALYTICS PAGE
  // ═══════════════════════════════════════════════════
  const renderAnalytics = () => {
    // Use historical data if selected, otherwise use current data
    let displayData = A;
    if (viewAnalyticsSnapshot) {
      displayData = {
        tOcc: viewAnalyticsSnapshot.total_occupied,
        tFree: viewAnalyticsSnapshot.total_free,
        util: Number(viewAnalyticsSnapshot.utilization_pct),
        sdOcc: viewAnalyticsSnapshot.sd_occupied,
        ddOcc: viewAnalyticsSnapshot.dd_occupied,
        sdCap: data.filter(s=>s.type==="SD").reduce((a,s)=>a+s.cap,0),
        ddCap: data.filter(s=>s.type==="DD").reduce((a,s)=>a+s.cap,0),
        hot: [],
        cold: [],
        totalWithFloor: viewAnalyticsSnapshot.total_occupied + (viewAnalyticsSnapshot.floor_pallets||0),
        floorPct: viewAnalyticsSnapshot.floor_pallets ? ((viewAnalyticsSnapshot.floor_pallets/(viewAnalyticsSnapshot.total_occupied + viewAnalyticsSnapshot.floor_pallets))*100).toFixed(1) : 0,
        shelfPct: ((viewAnalyticsSnapshot.total_occupied/(viewAnalyticsSnapshot.total_occupied + (viewAnalyticsSnapshot.floor_pallets||0)))*100).toFixed(1)
      };
    }

    const{tOcc,tFree,util,sdOcc,ddOcc,sdCap,ddCap,hot,cold,totalWithFloor,floorPct,shelfPct}=displayData;
    const shelfBar=data.map(s=>({name:s.name,Occupied:s.occ,Free:s.free}));

    const floorShelfPie=[
      {name:"On Shelf",value:tOcc,color:C.accent},
      {name:"On Floor",value:viewAnalyticsSnapshot?viewAnalyticsSnapshot.floor_pallets:floorPallets,color:C.floor},
    ];
    const occPie=[{name:"Occupied (Shelf)",value:tOcc,color:C.orange},{name:"Free",value:tFree,color:C.green},{name:"On Floor",value:viewAnalyticsSnapshot?viewAnalyticsSnapshot.floor_pallets:floorPallets,color:C.floor}];

    return(
      <div style={{padding:"20px 28px",maxWidth:1600,margin:"0 auto"}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-end",marginBottom:18,flexWrap:"wrap"}}>
          <div>
            <div style={{fontFamily:"monospace",fontSize:8,letterSpacing:2,color:C.dim,marginBottom:3}}>VIEW HISTORICAL ANALYTICS</div>
            <select value={viewAnalyticsDate||""} onChange={(e)=>loadHistoricalAnalytics(e.target.value)} style={{background:C.card,border:`1px solid ${C.border}`,color:C.text,padding:"8px 12px",fontSize:12,fontFamily:"monospace",borderRadius:3,cursor:"pointer"}}>
              <option value="">-- Current Date --</option>
              {snaps.map((snap,i)=><option key={i} value={snap.week_label.split(' ')[0]}>{snap.week_label}</option>)}
            </select>
          </div>
          {viewAnalyticsDate && <Btn c={C.red} onClick={()=>{setViewAnalyticsDate(null);setViewAnalyticsSnapshot(null);notify("Viewing current analytics","info")}}>CLEAR FILTER</Btn>}
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          {/* KPIs */}
          <div style={{display:"flex",gap:9,flex:1,flexWrap:"wrap"}}>
            <KPI l="Total Shelf Capacity" v={TOTAL_CAP.toLocaleString()} c={C.accent} s="26 shelves · 6 levels"/>
            <KPI l="On Shelf" v={tOcc.toLocaleString()} c={C.orange} s={`${util}% utilized`} d={wowDelta?`${wowDelta.util>0?"+":""}${wowDelta.util}% WoW`:null}/>
            <KPI l="Shelf Free" v={tFree.toLocaleString()} c={C.green} s={`${(100-util).toFixed(1)}% available`}/>
            <KPI l="On Floor" v={floorPallets.toLocaleString()} c={C.floor} s={`${floorPct}% of all pallets`} d={wowDelta?`${wowDelta.floor>0?"+":""}${wowDelta.floor} WoW`:null}/>
            <KPI l="Total Pallets" v={totalWithFloor.toLocaleString()} c={C.purple} s="Shelf + Floor combined"/>
            <KPI l="Utilization" v={`${util}%`} c={util>85?C.red:util>60?C.yellow:C.green} s={util>85?"Near capacity":"Healthy"}/>
          </div>
        </div>

        {/* Row 1: Donuts + SD vs DD */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
          <div style={card}>
            <div style={lbl}>ON SHELF vs ON FLOOR</div>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={floorShelfPie.filter(d=>d.value>0)} cx="50%" cy="50%" innerRadius={52} outerRadius={85} dataKey="value" stroke="none" paddingAngle={3}>
                  {floorShelfPie.filter(d=>d.value>0).map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip content={<CTip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:2}}>
              <MiniStat l="ON SHELF" v={`${shelfPct}%`} c={C.accent}/>
              <MiniStat l="ON FLOOR" v={`${floorPct}%`} c={C.floor}/>
            </div>
          </div>

          <div style={card}>
            <div style={lbl}>WAREHOUSE OCCUPANCY</div>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={occPie.filter(d=>d.value>0)} cx="50%" cy="50%" innerRadius={52} outerRadius={85} dataKey="value" stroke="none" paddingAngle={2}>
                  {occPie.filter(d=>d.value>0).map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip content={<CTip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:2}}>
              {occPie.filter(d=>d.value>0).map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:C.mid}}>
                <div style={{width:7,height:7,borderRadius:1,background:d.color}}/>{d.name}: {d.value.toLocaleString()}
              </div>)}
            </div>
          </div>

          <div style={card}>
            <div style={lbl}>RACK TYPE: SD vs DD</div>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={[{n:"Single Deep",Occ:sdOcc,Free:sdCap-sdOcc},{n:"Double Deep",Occ:ddOcc,Free:ddCap-ddOcc}]} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid}/>
                <XAxis dataKey="n" tick={{fill:C.dim,fontSize:9}} axisLine={false}/>
                <YAxis tick={{fill:C.dim,fontSize:8}} axisLine={false}/>
                <Tooltip content={<CTip/>}/>
                <Bar dataKey="Occ" name="Occupied" fill={C.orange} radius={[3,3,0,0]}/>
                <Bar dataKey="Free" name="Free" fill={C.green} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
            <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:2}}>
              <MiniStat l="SD" v={`${sdCap?(sdOcc/sdCap*100).toFixed(1):0}%`} c={C.accent}/>
              <MiniStat l="DD" v={`${ddCap?(ddOcc/ddCap*100).toFixed(1):0}%`} c={C.yellow}/>
            </div>
          </div>
        </div>

        {/* Row 2: Full shelf bar chart */}
        <div style={{...card,marginBottom:12}}>
          <div style={lbl}>ALL 26 SHELVES — OCCUPIED vs FREE</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={shelfBar} barGap={1}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid}/>
              <XAxis dataKey="name" tick={{fill:C.dim,fontSize:7}} axisLine={false} interval={0} angle={-45} textAnchor="end" height={40}/>
              <YAxis tick={{fill:C.dim,fontSize:8}} axisLine={false}/>
              <Tooltip content={<CTip/>}/>
              <Bar dataKey="Occupied" stackId="a" fill={C.orange}/>
              <Bar dataKey="Free" stackId="a" fill={C.green} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          {floorPallets>0&&(
            <div style={{marginTop:12,padding:"10px 14px",background:C.floorDim,border:`1px solid ${C.floor}22`,borderRadius:3,display:"flex",alignItems:"center",gap:16}}>
              <div style={{fontSize:9,fontFamily:"monospace",color:C.floor,letterSpacing:2,minWidth:120}}>FLOOR PALLETS</div>
              <div style={{flex:1,height:14,background:C.border,borderRadius:3,overflow:"hidden",position:"relative"}}>
                <div style={{width:`${Math.min((floorPallets/TOTAL_CAP)*100*4,100)}%`,height:"100%",background:C.floor,borderRadius:3,transition:"width 0.5s"}}/>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:C.floor,fontFamily:"monospace",minWidth:60,textAlign:"right"}}>{floorPallets}</div>
            </div>
          )}
        </div>

        {/* Row 2b: Floor Pallets by Account */}
        {floorPallets>0&&(
          <div style={{...card,marginBottom:12}}>
            <div style={lbl}>PALLETS ON FLOOR BY ACCOUNT</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={floorAccounts.filter(a=>parseInt(a.value)>0).map((a)=>({name:a.name||`Account ${floorAccounts.indexOf(a)+1}`,Pallets:parseInt(a.value)||0,fill:ACCT_COLORS[floorAccounts.indexOf(a)%ACCT_COLORS.length]}))} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid}/>
                <XAxis dataKey="name" tick={{fill:C.dim,fontSize:9}} axisLine={false}/>
                <YAxis tick={{fill:C.dim,fontSize:8}} axisLine={false}/>
                <Tooltip content={<CTip/>}/>
                <Bar dataKey="Pallets" radius={[4,4,0,0]}>
                  {floorAccounts.filter(a=>parseInt(a.value)>0).map((a,i)=>{
                    const origIdx=floorAccounts.indexOf(a);
                    return <Cell key={i} fill={ACCT_COLORS[origIdx%ACCT_COLORS.length]}/>;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:6,flexWrap:"wrap"}}>
              {floorAccounts.filter(a=>parseInt(a.value)>0).map((a,i)=>{
                const origIdx=floorAccounts.indexOf(a);
                const pct=floorPallets?((parseInt(a.value)/floorPallets)*100).toFixed(1):0;
                return(<div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:9,color:C.mid}}>
                  <div style={{width:8,height:8,borderRadius:2,background:ACCT_COLORS[origIdx%ACCT_COLORS.length]}}/>
                  {a.name||`Account ${origIdx+1}`}: <b style={{color:ACCT_COLORS[origIdx%ACCT_COLORS.length]}}>{a.value}</b> <span style={{color:C.dim}}>({pct}%)</span>
                </div>);
              })}
            </div>
          </div>
        )}

        {/* Row 3: Heatmap + Hot/Cold */}
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:12}}>
          <div style={card}>
            <div style={lbl}>UTILIZATION HEATMAP</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(13,1fr)",gap:3}}>
              {data.map((s,i)=>{
                const bg=s.util>90?C.red:s.util>70?C.orange:s.util>40?C.yellow:s.util>10?C.green:C.border;
                return(<div key={i} title={`${s.name}: ${s.util}% (${s.occ}/${s.cap})`}
                  style={{background:bg,opacity:Math.max(0.3,s.util/100),padding:"10px 3px",textAlign:"center",borderRadius:2}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#fff"}}>{s.name}</div>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.7)"}}>{s.util}%</div>
                </div>);
              })}
            </div>
            <div style={{display:"flex",gap:14,marginTop:10,justifyContent:"center"}}>
              {[{l:">90%",c:C.red},{l:"70-90%",c:C.orange},{l:"40-70%",c:C.yellow},{l:"<40%",c:C.green}].map((x,i)=>
                <div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:C.mid}}>
                  <div style={{width:10,height:7,borderRadius:1,background:x.c}}/>{x.l}
                </div>)}
            </div>
          </div>

          <div style={card}>
            <div style={lbl}>HOT & COLD SHELVES</div>
            <div style={{fontSize:8,color:C.red,letterSpacing:2,fontFamily:"monospace",marginBottom:4}}>HIGHEST</div>
            {hot.map((s,i)=><SBar key={i} s={s} c={s.util>90?C.red:C.orange}/>)}
            <div style={{fontSize:8,color:C.green,letterSpacing:2,fontFamily:"monospace",marginTop:12,marginBottom:4}}>MOST AVAILABLE</div>
            {cold.map((s,i)=><SBar key={i} s={s} c={C.green}/>)}
          </div>
        </div>

        {/* Row 4: Table */}
        <div style={{...card,overflowX:"auto"}}>
          <div style={lbl}>SHELF REGISTRY</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,fontFamily:"monospace"}}>
            <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["Shelf","Type","Cap","Occupied","Free","F-Empty","B-Empty","K-Empty","Util%","Status"].map(h=>
                <th key={h} style={{padding:"6px 8px",textAlign:"left",color:C.dim,fontSize:8,letterSpacing:2,fontWeight:400}}>{h}</th>)}
            </tr></thead>
            <tbody>{data.map((s,i)=>{
              const sc=s.util>90?C.red:s.util>70?C.orange:s.util>40?C.yellow:C.green;
              const sl=s.util>90?"CRITICAL":s.util>70?"HIGH":s.util>40?"OPTIMAL":s.util>10?"LOW":"EMPTY";
              return(<tr key={i} style={{borderBottom:`1px solid ${C.border}08`}}>
                <td style={{padding:"5px 8px",color:C.accent,fontWeight:700}}>{s.name}</td>
                <td style={{padding:"5px 8px",color:s.type==="DD"?C.yellow:C.mid}}>{s.type}</td>
                <td style={{padding:"5px 8px",color:C.mid}}>{s.cap}</td>
                <td style={{padding:"5px 8px",color:C.orange}}>{s.occ}</td>
                <td style={{padding:"5px 8px",color:C.green}}>{s.free}</td>
                <td style={{padding:"5px 8px",color:C.dim}}>{s.fE}</td>
                <td style={{padding:"5px 8px",color:C.dim}}>{s.bE}</td>
                <td style={{padding:"5px 8px",color:C.dim}}>{s.kE}</td>
                <td style={{padding:"5px 8px",color:sc,fontWeight:700}}>{s.util}%</td>
                <td style={{padding:"5px 8px"}}><span style={{fontSize:8,padding:"2px 6px",border:`1px solid ${sc}44`,color:sc,background:`${sc}11`,letterSpacing:1,fontWeight:700}}>{sl}</span></td>
              </tr>);
            })}</tbody>
          </table>
          {floorPallets>0&&(
            <div style={{borderTop:`1px solid ${C.floor}33`,padding:"10px 8px",marginTop:4}}>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:6}}>
                <span style={{fontSize:10,fontWeight:800,color:C.floor,fontFamily:"monospace",letterSpacing:2}}>FLOOR</span>
                <span style={{fontSize:10,color:C.mid}}>Not on shelf</span>
                <span style={{fontSize:18,fontWeight:900,color:C.floor,fontFamily:"monospace"}}>{floorPallets} pallets</span>
                <span style={{fontSize:10,color:C.mid}}>({A.floorPct}% of total inventory)</span>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {floorAccounts.filter(a=>parseInt(a.value)>0).map((a,i)=>{
                  const origIdx=floorAccounts.indexOf(a);
                  return(<span key={i} style={{fontSize:9,fontFamily:"monospace",color:ACCT_COLORS[origIdx%ACCT_COLORS.length],background:`${ACCT_COLORS[origIdx%ACCT_COLORS.length]}12`,border:`1px solid ${ACCT_COLORS[origIdx%ACCT_COLORS.length]}33`,padding:"3px 8px",borderRadius:3}}>
                    {a.name||`Account ${origIdx+1}`}: <b>{a.value}</b>
                  </span>);
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  //  TRENDS PAGE
  // ═══════════════════════════════════════════════════
  const renderTrends = () => {
    if(!snaps.length) return(
      <div style={{padding:40,textAlign:"center",color:C.dim}}>
        <div style={{fontSize:13,color:C.mid}}>No weekly records yet. Save a week from the Input page to start tracking.</div>
      </div>
    );

    const latest=snaps[snaps.length-1],prev=snaps.length>1?snaps[snaps.length-2]:null;
    const trendMain=snaps.map(s=>({week:s.week_label,"On Shelf":s.total_occupied,Free:s.total_free,"On Floor":s.floor_pallets||0,"Util%":Number(s.utilization_pct)}));
    const floorTrend=snaps.map(s=>({week:s.week_label,"Floor Pallets":s.floor_pallets||0,"On Shelf":s.total_occupied}));
    const ratioTrend=snaps.map(s=>{
      const total=s.total_occupied+(s.floor_pallets||0);
      return{week:s.week_label,"Shelf%":total?(s.total_occupied/total*100).toFixed(1):100,"Floor%":total?((s.floor_pallets||0)/total*100).toFixed(1):0};
    });
    const typeTrend=snaps.map(s=>({week:s.week_label,"SD Occ":s.sd_occupied,"DD Occ":s.dd_occupied}));

    const avgUtil=(snaps.reduce((a,s)=>a+Number(s.utilization_pct),0)/snaps.length).toFixed(1);
    const avgFloor=Math.round(snaps.reduce((a,s)=>a+(s.floor_pallets||0),0)/snaps.length);
    const peakFloor=Math.max(...snaps.map(s=>s.floor_pallets||0));

    return(
      <div style={{padding:"20px 28px",maxWidth:1600,margin:"0 auto"}}>
        <div style={{display:"flex",gap:9,marginBottom:18,flexWrap:"wrap"}}>
          <KPI l="Latest Week" v={latest.week_label} c={C.accent} s={`${snaps.length} weeks tracked`}/>
          <KPI l="Current Util" v={`${latest.utilization_pct}%`} c={Number(latest.utilization_pct)>85?C.red:C.yellow}
            d={prev?`${(latest.utilization_pct-prev.utilization_pct)>0?"+":""}${(latest.utilization_pct-prev.utilization_pct).toFixed(1)}%`:null}/>
          <KPI l="Avg Utilization" v={`${avgUtil}%`} c={C.purple} s={`Over ${snaps.length} weeks`}/>
          <KPI l="Current Floor" v={(latest.floor_pallets||0).toLocaleString()} c={C.floor}
            d={prev?`${((latest.floor_pallets||0)-(prev.floor_pallets||0))>0?"+":""}${(latest.floor_pallets||0)-(prev.floor_pallets||0)}`:null}/>
          <KPI l="Avg Floor" v={avgFloor.toLocaleString()} c={C.floor} s="Weekly average"/>
          <KPI l="Peak Floor" v={peakFloor.toLocaleString()} c={C.red} s="Worst week"/>
        </div>

        <div style={{...card,marginBottom:12}}>
          <div style={lbl}>WAREHOUSE TREND — ON SHELF + ON FLOOR + UTILIZATION</div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={trendMain}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid}/>
              <XAxis dataKey="week" tick={{fill:C.dim,fontSize:8}} axisLine={false} angle={-30} textAnchor="end" height={45}/>
              <YAxis yAxisId="l" tick={{fill:C.dim,fontSize:8}} axisLine={false}/>
              <YAxis yAxisId="r" orientation="right" tick={{fill:C.dim,fontSize:8}} axisLine={false} domain={[0,100]}/>
              <Tooltip content={<CTip/>}/>
              <Legend wrapperStyle={{fontSize:10,color:C.mid}}/>
              <Area yAxisId="l" type="monotone" dataKey="On Shelf" fill={C.orangeDim} stroke={C.orange} strokeWidth={2}/>
              <Area yAxisId="l" type="monotone" dataKey="Free" fill={C.greenDim} stroke={C.green} strokeWidth={2}/>
              <Bar yAxisId="l" dataKey="On Floor" fill={C.floor} opacity={0.8} barSize={12} radius={[2,2,0,0]}/>
              <Line yAxisId="r" type="monotone" dataKey="Util%" stroke={C.accent} strokeWidth={2.5} dot={{r:3,fill:C.accent}}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <div style={card}>
            <div style={lbl}>FLOOR PALLETS — WEEKLY TREND</div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={floorTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid}/>
                <XAxis dataKey="week" tick={{fill:C.dim,fontSize:8}} axisLine={false} angle={-30} textAnchor="end" height={40}/>
                <YAxis tick={{fill:C.dim,fontSize:8}} axisLine={false}/>
                <Tooltip content={<CTip/>}/>
                <Area type="monotone" dataKey="Floor Pallets" stroke={C.floor} fill={C.floorDim} strokeWidth={2.5}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={card}>
            <div style={lbl}>ON-SHELF vs ON-FLOOR RATIO — WEEKLY</div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={ratioTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid}/>
                <XAxis dataKey="week" tick={{fill:C.dim,fontSize:8}} axisLine={false} angle={-30} textAnchor="end" height={40}/>
                <YAxis tick={{fill:C.dim,fontSize:8}} axisLine={false} domain={[0,100]} unit="%"/>
                <Tooltip content={<CTip/>}/>
                <Area type="monotone" dataKey="Shelf%" stackId="1" stroke={C.accent} fill={C.accentDim} strokeWidth={2}/>
                <Area type="monotone" dataKey="Floor%" stackId="1" stroke={C.floor} fill={C.floorDim} strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{...card,marginBottom:12}}>
          <div style={lbl}>SD vs DD — WEEKLY OCCUPANCY</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={typeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid}/>
              <XAxis dataKey="week" tick={{fill:C.dim,fontSize:8}} axisLine={false} angle={-30} textAnchor="end" height={40}/>
              <YAxis tick={{fill:C.dim,fontSize:8}} axisLine={false}/>
              <Tooltip content={<CTip/>}/>
              <Area type="monotone" dataKey="SD Occ" stackId="1" stroke={C.accent} fill={C.accentDim}/>
              <Area type="monotone" dataKey="DD Occ" stackId="1" stroke={C.yellow} fill={C.yellowDim}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{...card,overflowX:"auto"}}>
          <div style={lbl}>WEEKLY SNAPSHOTS LOG</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,fontFamily:"monospace"}}>
            <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["Week","Capacity","On Shelf","Free","Floor","Util%","SD Occ","DD Occ","Crit","High","Opt","Low"].map(h=>
                <th key={h} style={{padding:"5px 7px",textAlign:"left",color:C.dim,fontSize:7,letterSpacing:2,fontWeight:400}}>{h}</th>)}
            </tr></thead>
            <tbody>{snaps.slice().reverse().map((s,i)=>{
              const u=Number(s.utilization_pct),uc=u>90?C.red:u>70?C.orange:u>40?C.yellow:C.green;
              return(<tr key={i} style={{borderBottom:`1px solid ${C.border}08`}}>
                <td style={{padding:"4px 7px",color:C.accent,fontWeight:700}}>{s.week_label}</td>
                <td style={{padding:"4px 7px",color:C.mid}}>{Number(s.total_capacity).toLocaleString()}</td>
                <td style={{padding:"4px 7px",color:C.orange}}>{Number(s.total_occupied).toLocaleString()}</td>
                <td style={{padding:"4px 7px",color:C.green}}>{Number(s.total_free).toLocaleString()}</td>
                <td style={{padding:"4px 7px",color:C.floor,fontWeight:700}}>{(s.floor_pallets||0).toLocaleString()}</td>
                <td style={{padding:"4px 7px",color:uc,fontWeight:700}}>{s.utilization_pct}%</td>
                <td style={{padding:"4px 7px",color:C.mid}}>{Number(s.sd_occupied).toLocaleString()}</td>
                <td style={{padding:"4px 7px",color:C.mid}}>{Number(s.dd_occupied).toLocaleString()}</td>
                <td style={{padding:"4px 7px",color:s.critical_shelves>0?C.red:C.dim}}>{s.critical_shelves}</td>
                <td style={{padding:"4px 7px",color:C.orange}}>{s.high_shelves}</td>
                <td style={{padding:"4px 7px",color:C.green}}>{s.optimal_shelves}</td>
                <td style={{padding:"4px 7px",color:C.yellow}}>{s.low_shelves}</td>
              </tr>);
            })}</tbody>
          </table>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  //  REPORT HISTORY PAGE
  // ═══════════════════════════════════════════════════
  const renderReportHistory = () => {
    const reportDates = snaps.map(s => ({label: s.week_label, date: s.week_label.split(' ')[0]})).reverse();
    const selectedReport = snaps.find(s => s.week_label.split(' ')[0] === viewReportDate);

    return(
      <div style={{padding:"20px 28px",maxWidth:1600,margin:"0 auto"}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-end",marginBottom:20,flexWrap:"wrap"}}>
          <div>
            <div style={{fontFamily:"monospace",fontSize:8,letterSpacing:2,color:C.dim,marginBottom:3}}>SELECT REPORT DATE</div>
            <select value={viewReportDate||""} onChange={(e)=>loadHistoricalReport(e.target.value)} style={{background:C.card,border:`1px solid ${C.border}`,color:C.text,padding:"8px 12px",fontSize:12,fontFamily:"monospace",borderRadius:3,cursor:"pointer"}}>
              <option value="">-- Choose a date --</option>
              {reportDates.map((rd,i)=><option key={i} value={rd.date}>{rd.label}</option>)}
            </select>
          </div>
        </div>

        {selectedReport && viewReportRecords.length > 0 && (
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,marginBottom:20}}>
              <div style={{...card}}>
                <div style={lbl}>REPORT DATE</div>
                <div style={{fontSize:18,fontWeight:800,color:C.accent}}>{selectedReport.week_label}</div>
              </div>
              <div style={{...card}}>
                <div style={lbl}>TOTAL CAPACITY</div>
                <div style={{fontSize:18,fontWeight:800,color:C.accent}}>{selectedReport.total_capacity.toLocaleString()}</div>
              </div>
              <div style={{...card}}>
                <div style={lbl}>ON SHELF</div>
                <div style={{fontSize:18,fontWeight:800,color:C.orange}}>{selectedReport.total_occupied.toLocaleString()}</div>
              </div>
              <div style={{...card}}>
                <div style={lbl}>FREE SPACES</div>
                <div style={{fontSize:18,fontWeight:800,color:C.green}}>{selectedReport.total_free.toLocaleString()}</div>
              </div>
              <div style={{...card}}>
                <div style={lbl}>FLOOR PALLETS</div>
                <div style={{fontSize:18,fontWeight:800,color:C.floor}}>{selectedReport.floor_pallets.toLocaleString()}</div>
              </div>
              <div style={{...card}}>
                <div style={lbl}>UTILIZATION</div>
                <div style={{fontSize:18,fontWeight:800,color:selectedReport.utilization_pct>85?C.red:selectedReport.utilization_pct>60?C.yellow:C.green}}>{selectedReport.utilization_pct}%</div>
              </div>
            </div>

            <div style={{...card,marginBottom:12}}>
              <div style={lbl}>SHELF DETAILS</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,fontFamily:"monospace"}}>
                <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
                  {["Shelf","Occupied","Free","F-Empty","B-Empty","K-Empty","Util%"].map(h=>
                    <th key={h} style={{padding:"6px 8px",textAlign:"left",color:C.dim,fontSize:8,letterSpacing:2,fontWeight:400}}>{h}</th>)}
                </tr></thead>
                <tbody>{viewReportRecords.map((rec,i)=>{
                  const shelf = SHELVES.find(s => s.id === rec.shelf_id);
                  return(<tr key={i} style={{borderBottom:`1px solid ${C.border}08`}}>
                    <td style={{padding:"5px 8px",color:C.accent,fontWeight:700}}>{shelf?.name}</td>
                    <td style={{padding:"5px 8px",color:C.orange}}>{rec.occupied.toLocaleString()}</td>
                    <td style={{padding:"5px 8px",color:C.green}}>{rec.free.toLocaleString()}</td>
                    <td style={{padding:"5px 8px",color:C.dim}}>{rec.front_empties}</td>
                    <td style={{padding:"5px 8px",color:C.dim}}>{rec.bridge_empties}</td>
                    <td style={{padding:"5px 8px",color:C.dim}}>{rec.back_empties}</td>
                    <td style={{padding:"5px 8px",color:C.yellow,fontWeight:700}}>{rec.utilization_pct}%</td>
                  </tr>);
                })}</tbody>
              </table>
            </div>
          </>
        )}

        {!viewReportDate && (
          <div style={{...card,textAlign:"center",color:C.dim,padding:40}}>
            <div style={{fontSize:14}}>Select a report date above to view details</div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  //  3D MAP PAGE
  // ═══════════════════════════════════════════════════
  const render3D = () => (
    <Warehouse3D data={data} floorPallets={floorPallets} />
  );


  // ═══════════════════════════════════════════════════
  //  SHELL
  // ═══════════════════════════════════════════════════
  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      {/* Save Confirmation Modal */}
      {showConfirm && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:C.card,border:`2px solid ${C.accent}`,borderRadius:8,padding:30,maxWidth:400,boxShadow:`0 0 40px ${C.accentDim}`}}>
            <div style={{fontSize:16,fontWeight:700,color:C.accent,marginBottom:15}}>CONFIRM SAVE</div>
            <div style={{color:C.text,marginBottom:20,lineHeight:1.5}}>
              Are you sure you want to save the warehouse data for <strong>{recordDate}</strong> to Supabase?
              <br/><br/>
              This action will record all shelf empties and floor pallets permanently.
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowConfirm(false)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.dim,padding:"8px 16px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"monospace",borderRadius:3,transition:"all 0.15s"}}>CANCEL</button>
              <button onClick={saveWeek} style={{background:C.green+"22",border:`1px solid ${C.green}44`,color:C.green,padding:"8px 16px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"monospace",borderRadius:3,transition:"all 0.15s"}}>CONFIRM SAVE</button>
            </div>
          </div>
        </div>
      )}

      {notif&&(<div style={{position:"fixed",top:12,right:12,zIndex:999,maxWidth:520,
        background:notif.t==="error"?C.redDim:notif.t==="info"?C.accentDim:C.greenDim,
        border:`1px solid ${notif.t==="error"?C.red:notif.t==="info"?C.accent:C.green}55`,
        color:notif.t==="error"?C.red:notif.t==="info"?C.accent:C.green,
        padding:"10px 16px",fontSize:11,fontWeight:600,letterSpacing:1,borderRadius:3,
        animation:"slideIn 0.3s ease",fontFamily:"monospace",
      }}>{notif.m}</div>)}

      {/* Header */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",height:52}}>
        <div>
          <div style={{fontSize:17,fontWeight:900,letterSpacing:5,color:C.accent,textShadow:`0 0 14px ${C.accentDim}`,fontFamily:"monospace"}}>DISTRILOGIK</div>
          <div style={{fontSize:7,fontFamily:"monospace",color:C.dim,letterSpacing:3}}>LAX 3PL · WAREHOUSE + FLOOR TRACKING</div>
        </div>
        <div style={{display:"flex",gap:2}}>
          {[["input","INPUT"],["analytics","ANALYTICS"],["trends","WEEKLY TRENDS"],["reports","REPORT HISTORY"],["3d","3D MAP"]].map(([k,l])=>(
            <button key={k} onClick={()=>setPage(k)} style={{
              background:page===k?C.accentDim:"transparent",border:`1px solid ${page===k?C.accent+"44":C.border}`,
              color:page===k?C.accent:C.dim,padding:"6px 16px",fontSize:9,fontWeight:700,letterSpacing:2,
              cursor:"pointer",fontFamily:"monospace",borderRadius:2,transition:"all 0.15s",
            }}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:C.green,boxShadow:`0 0 5px ${C.green}`,animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:7,fontFamily:"monospace",color:C.green,letterSpacing:2}}>SUPABASE CONNECTED</span>
        </div>
      </div>

      <div style={{height:"calc(100vh - 52px)",overflowY:page==="3d"?"hidden":"auto"}}>
        {page==="input"?renderInput():page==="analytics"?renderAnalytics():page==="reports"?renderReportHistory():page==="3d"?render3D():renderTrends()}
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.12}}
        @keyframes slideIn{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}
        input:focus,select:focus{border-color:${C.accent}!important;box-shadow:0 0 8px ${C.accentDim};outline:none}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        table tr:hover{background:rgba(100,149,237,0.08)}
        button:hover{filter:brightness(0.95)}
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  SUBCOMPONENTS
// ═══════════════════════════════════════════════════
function KPI({l,v,c,s,d}){
  const C2={card:"#faf5ef",border:"#e8ddd0",dim:"#8b8b8b",mid:"#5c5c5c",red:"#c41e3a",green:"#7ccd7c"};
  return(<div style={{background:C2.card,border:`1px solid ${C2.border}`,borderRadius:4,padding:"14px 18px",flex:1,minWidth:155,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:-16,right:-6,fontSize:56,opacity:0.025,color:c,fontWeight:900,lineHeight:1}}>◆</div>
    <div style={{fontFamily:"monospace",fontSize:7,letterSpacing:3,color:C2.dim,textTransform:"uppercase",marginBottom:5}}>{l}</div>
    <div style={{fontSize:27,fontWeight:800,color:c,letterSpacing:1,lineHeight:1}}>{v}</div>
    {s&&<div style={{fontSize:9,color:C2.mid,marginTop:4}}>{s}</div>}
    {d&&<div style={{fontSize:8,fontFamily:"monospace",color:d.includes("+")?C2.red:C2.green,marginTop:2}}>{d}</div>}
  </div>);
}

function MiniStat({l,v,c}){
  const C2={dim:"#8b8b8b"};
  return(<div style={{textAlign:"center"}}>
    <div style={{fontSize:7,fontFamily:"monospace",color:C2.dim,letterSpacing:1}}>{l}</div>
    <div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div>
  </div>);
}

function SBar({s,c}){
  const C2={accent:"#6495ed",border:"#e8ddd0"};
  return(<div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
    <span style={{fontSize:9,fontWeight:700,color:C2.accent,minWidth:26,fontFamily:"monospace"}}>{s.name}</span>
    <div style={{flex:1,height:5,background:C2.border,borderRadius:3,overflow:"hidden"}}>
      <div style={{width:`${s.util}%`,height:"100%",background:c,borderRadius:3,transition:"width 0.4s"}}/>
    </div>
    <span style={{fontSize:8,fontWeight:700,color:c,minWidth:34,textAlign:"right",fontFamily:"monospace"}}>{s.util}%</span>
  </div>);
}

function Btn({c,filled,children,...p}){
  return <button style={{background:filled?`${c}22`:"transparent",border:`1px solid ${c}44`,color:c,padding:"8px 16px",fontSize:10,fontWeight:700,letterSpacing:2,cursor:"pointer",fontFamily:"monospace",borderRadius:3,transition:"all 0.15s"}} {...p}>{children}</button>;
}
