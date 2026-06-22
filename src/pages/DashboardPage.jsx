import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PropCard, { getSaved } from '../components/PropCard.jsx';
import { PROPERTIES, AGENTS } from '../data/data.js';
import { useAuth } from '../context/AuthContext.jsx';

const CUSTOMER_MENU = [
  { key: 'overview',  label: 'Overview',         icon: 'ti-layout-dashboard' },
  { key: 'saved',     label: 'Saved Properties', icon: 'ti-heart' },
  { key: 'searches',  label: 'Recent Searches',  icon: 'ti-history' },
  { key: 'alerts',    label: 'My Alerts',         icon: 'ti-bell' },
  { key: 'enquiries', label: 'My Enquiries',      icon: 'ti-message-circle' },
  { key: 'agents',    label: 'Find Agents',       icon: 'ti-users' },
  { key: 'settings',  label: 'Settings',          icon: 'ti-settings' },
];

const FRANCHISE_MENU = [
  { key: 'overview',  label: 'Dashboard',    icon: 'ti-layout-dashboard' },
  { key: 'listings',  label: 'My Listings',  icon: 'ti-building' },
  { key: 'leads',     label: 'Leads',         icon: 'ti-user-star' },
  { key: 'post',      label: 'Post Property', icon: 'ti-plus-circle' },
  { key: 'analytics', label: 'Analytics',    icon: 'ti-chart-bar' },
  { key: 'agents',    label: 'My Team',       icon: 'ti-users' },
  { key: 'settings',  label: 'Settings',      icon: 'ti-settings' },
];

const SEARCH_HISTORY = [
  ['3 BHK in Whitefield, Bengaluru','₹60L – ₹1.5Cr','2 hours ago','Whitefield'],
  ['2 BHK in Chembur, Mumbai','Under ₹80L','Yesterday','Chembur'],
  ['Villa in Gurugram','Above ₹2Cr','2 days ago','Gurugram'],
  ['1 BHK in Thane West','₹30L – ₹60L','3 days ago','Thane'],
  ['Plots in Hyderabad','Under ₹50L','5 days ago','Hyderabad'],
  ['Office Space in Bengaluru','₹50K/mo','1 week ago','Bengaluru'],
];

const LEADS = [
  { id:1, name:'Rahul Mehta',    phone:'+91 98001 11111', property:'Prestige Lake Ridge', interest:'3 BHK', budget:'1.2Cr', date:'Today 10:32 AM', status:'new' },
  { id:2, name:'Sneha Joshi',    phone:'+91 99002 22222', property:'DLF The Arbour',      interest:'4 BHK', budget:'2.8Cr', date:'Today 9:15 AM',  status:'contacted' },
  { id:3, name:'Amit Srivastav', phone:'+91 97003 33333', property:'Sobha Dream Acres',   interest:'2 BHK', budget:'75L',   date:'Yesterday',       status:'converted' },
  { id:4, name:'Pooja Singh',    phone:'+91 96004 44444', property:'Tata Serein Phase 2', interest:'2 BHK', budget:'95L',   date:'2 days ago',      status:'contacted' },
  { id:5, name:'Kiran Patel',    phone:'+91 95005 55555', property:'Brigade Orchards',    interest:'3 BHK', budget:'1.6Cr', date:'3 days ago',      status:'lost' },
  { id:6, name:'Neeraj Kumar',   phone:'+91 94006 66666', property:'Lodha Palava City',   interest:'1 BHK', budget:'52L',   date:'4 days ago',      status:'new' },
];

const ENQUIRIES = [
  { id:1, property:'DLF The Arbour',      agent:'Rajesh Nair',  date:'Yesterday',  status:'replied', msg:'Interested in site visit this weekend.' },
  { id:2, property:'Tata Serein Phase 2', agent:'Priya Sharma', date:'3 days ago', status:'pending', msg:'Please share floor plan for 2 BHK unit.' },
  { id:3, property:'Sobha Dream Acres',   agent:'Ananya Patel', date:'1 week ago', status:'closed',  msg:'Visited the property. Will confirm by Monday.' },
];

const STATUS_CLASS = { new:'ls-new', contacted:'ls-contacted', converted:'ls-converted', lost:'ls-lost' };
const STATUS_LABEL = { new:'New Lead', contacted:'Contacted', converted:'Converted', lost:'Lost' };

function Toggle({ initial=false }) {
  const [on,setOn]=useState(initial);
  return <div className={`toggle ${on?'on':''}`} onClick={()=>setOn(v=>!v)}></div>;
}

function MiniChart({ bars }) {
  return (
    <div className="mini-chart">
      {bars.map((h,i)=>(
        <div key={i} className={`mc-bar ${i===bars.length-1?'active':''}`} style={{height:`${h}%`}}></div>
      ))}
    </div>
  );
}

/* ── CUSTOMER OVERVIEW ── */
function CustomerDashboard({ user, section, setSection, navigate }) {
  const [savedIds,setSavedIds]=useState([]);
  useEffect(()=>{ setSavedIds(getSaved()); },[section]);
  const savedProps=PROPERTIES.filter(p=>savedIds.includes(p.id));
  const initials = user.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

  return (
    <>
      <div className="customer-welcome">
        <div className="cw-avatar">{initials}</div>
        <div className="cw-info">
          <h3>Hi, {user.name?.split(' ')[0]} 👋</h3>
          <p>Here's what's happening with your property search</p>
          <div className="cw-tags">
            <span className="cw-tag"><i className="ti ti-user"></i> Customer</span>
            <span className="cw-tag"><i className="ti ti-map-pin"></i> {user.city||'India'}</span>
            <span className="cw-tag"><i className="ti ti-shield-check"></i> Verified</span>
          </div>
        </div>
      </div>

      {section==='overview' && (
        <div>
          <div className="stat-cards">
            <div className="stat-card"><div className="sc-num">{savedIds.length}</div><div className="sc-label">Saved Properties</div><div className="sc-change sc-up"><i className="ti ti-trending-up" style={{fontSize:12}}></i> +2 this week</div></div>
            <div className="stat-card"><div className="sc-num">6</div><div className="sc-label">Recent Searches</div><div className="sc-change sc-up"><i className="ti ti-search" style={{fontSize:12}}></i> Active</div></div>
            <div className="stat-card"><div className="sc-num">3</div><div className="sc-label">Active Alerts</div><div className="sc-change"><i className="ti ti-bell" style={{fontSize:12,color:'var(--gold2)'}}></i> 1 new match</div></div>
            <div className="stat-card"><div className="sc-num">2</div><div className="sc-label">Enquiries Sent</div><div className="sc-change sc-up"><i className="ti ti-check" style={{fontSize:12}}></i> 1 reply received</div></div>
          </div>
          <div className="search-hist" style={{marginBottom:20}}>
            <div className="sh-header"><h4>Recent Searches</h4><a className="see-all" style={{cursor:'pointer'}} onClick={()=>setSection('searches')}>View all</a></div>
            {SEARCH_HISTORY.slice(0,3).map(([q,budget,time,city])=>(
              <div className="sh-item" key={q} onClick={()=>navigate(`/search?q=${city}`)}>
                <div className="sh-icon"><i className="ti ti-search"></i></div>
                <div style={{flex:1}}><div className="sh-q">{q}</div><div className="sh-meta">{budget} · {time}</div></div>
                <i className="ti ti-arrow-right" style={{fontSize:16,color:'var(--text3)'}}></i>
              </div>
            ))}
          </div>
          <div className="section-head"><h2 className="section-title" style={{fontSize:18}}>Recommended for You</h2><a className="see-all" onClick={()=>navigate('/search')} style={{cursor:'pointer'}}>View all →</a></div>
          <div className="grid-auto">{PROPERTIES.slice(0,2).map(p=><PropCard key={p.id} p={p}/>)}</div>
        </div>
      )}

      {section==='saved' && (
        <div>
          <h2 className="dash-heading">Saved Properties</h2>
          {savedProps.length===0
            ? <div style={{textAlign:'center',padding:48,color:'var(--text3)'}}>
                <i className="ti ti-heart" style={{fontSize:40,display:'block',marginBottom:12,opacity:0.3}}></i>
                <p style={{fontSize:14}}>No saved properties yet.</p>
                <button className="btn-navy" style={{marginTop:16,padding:'10px 24px',borderRadius:8}} onClick={()=>navigate('/search')}>Browse Properties</button>
              </div>
            : <div className="grid-auto">{savedProps.map(p=><PropCard key={p.id} p={p}/>)}</div>
          }
        </div>
      )}

      {section==='searches' && (
        <div>
          <h2 className="dash-heading">Recent Searches</h2>
          <div className="search-hist">
            <div className="sh-header"><h4>History</h4><button className="btn-outline" style={{padding:'5px 12px',fontSize:12}} onClick={()=>alert('History cleared')}>Clear all</button></div>
            {SEARCH_HISTORY.map(([q,budget,time,city])=>(
              <div className="sh-item" key={q} onClick={()=>navigate(`/search?q=${city}`)}>
                <div className="sh-icon"><i className="ti ti-search"></i></div>
                <div style={{flex:1}}><div className="sh-q">{q}</div><div className="sh-meta">{budget} · {time}</div></div>
                <i className="ti ti-arrow-right" style={{fontSize:16,color:'var(--text3)'}}></i>
              </div>
            ))}
          </div>
        </div>
      )}

      {section==='alerts' && (
        <div>
          <h2 className="dash-heading">My Property Alerts</h2>
          <p style={{fontSize:13,color:'var(--text3)',marginBottom:20}}>Get notified when new properties match your criteria.</p>
          {[['3 BHK in Whitefield, Bengaluru','₹80L – ₹1.5Cr · Ready to Move',true],['2 BHK in Pune under ₹70L','Ready or Under Construction',true],['Villa in South Bengaluru','Above ₹3Cr · Swimming Pool',false]].map(([title,desc,state])=>(
            <div className="alert-card" key={title}>
              <div className="alert-icon"><i className="ti ti-bell"></i></div>
              <div className="alert-info"><div className="alert-title">{title}</div><div className="alert-desc">{desc}</div></div>
              <Toggle initial={state}/>
            </div>
          ))}
          <button className="btn-navy" style={{marginTop:8,padding:'11px 20px'}}><i className="ti ti-plus" style={{verticalAlign:-2}}></i> Create New Alert</button>
        </div>
      )}

      {section==='enquiries' && (
        <div>
          <h2 className="dash-heading">My Enquiries</h2>
          <div className="search-hist">
            <div className="sh-header"><h4>Sent Enquiries</h4></div>
            {ENQUIRIES.map(e=>(
              <div className="sh-item" key={e.id} style={{flexDirection:'column',alignItems:'flex-start',gap:8}}>
                <div style={{display:'flex',alignItems:'center',gap:10,width:'100%'}}>
                  <div className="sh-icon"><i className="ti ti-building"></i></div>
                  <div style={{flex:1}}><div className="sh-q">{e.property}</div><div className="sh-meta">Agent: {e.agent} · {e.date}</div></div>
                  <span className={`lead-status ${e.status==='replied'?'ls-converted':e.status==='pending'?'ls-contacted':'ls-new'}`}>{e.status.charAt(0).toUpperCase()+e.status.slice(1)}</span>
                </div>
                <div style={{paddingLeft:50,fontSize:13,color:'var(--text2)',fontStyle:'italic'}}>"{e.msg}"</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section==='agents' && <AgentsSection/>}
      {section==='settings' && <SettingsSection user={user}/>}
    </>
  );
}

/* ── FRANCHISE DASHBOARD ── */
function FranchiseDashboard({ user, section, navigate }) {
  return (
    <>
      <div className="franchise-header">
        <div className="fh-left">
          <h2>Welcome back, {user.name?.split(' ')[0]} 🏢</h2>
          <p>{user.businessName||'Your Agency'} · {user.city}</p>
          <div className="fh-badge"><i className="ti ti-building-store"></i> Franchise Partner</div>
        </div>
        <div className="fh-stats">
          <div className="fh-stat"><div className="fh-stat-num">{user.totalListings||62}</div><div className="fh-stat-lbl">Listings</div></div>
          <div className="fh-stat"><div className="fh-stat-num">{user.activeLeads||18}</div><div className="fh-stat-lbl">Leads</div></div>
          <div className="fh-stat"><div className="fh-stat-num">{user.dealsClosedMonth||4}</div><div className="fh-stat-lbl">Deals/Mo</div></div>
          <div className="fh-stat"><div className="fh-stat-num">{user.revenue||'₹8.4L'}</div><div className="fh-stat-lbl">Revenue</div></div>
        </div>
      </div>

      {section==='overview' && (
        <div>
          <div className="perf-grid">
            {[
              {icon:'ti-eye',      bg:'pi-blue', num:'4,821', lbl:'Listing Views',    trend:'+12%',up:true, bars:[30,45,35,60,55,70,80,65,85,90,75,100]},
              {icon:'ti-user-star',bg:'pi-gold', num:'18',    lbl:'Active Leads',     trend:'+6',  up:true, bars:[50,40,60,55,70,65,80,75,85,80,90,85]},
              {icon:'ti-handshake',bg:'pi-green',num:'4',     lbl:'Deals This Month', trend:'+2',  up:true, bars:[20,30,25,35,40,50,45,55,60,70,65,80]},
              {icon:'ti-currency-rupee',bg:'pi-red',num:'₹8.4L',lbl:'Revenue',       trend:'-2%', up:false,bars:[60,75,65,80,70,85,80,90,85,80,75,70]},
            ].map(c=>(
              <div className="perf-card" key={c.lbl}>
                <div className="perf-card-top">
                  <div className={`perf-icon ${c.bg}`}><i className={`ti ${c.icon}`}></i></div>
                  <span className={`perf-trend ${c.up?'trend-up':'trend-down'}`}><i className={`ti ${c.up?'ti-trending-up':'ti-trending-down'}`}></i>{c.trend}</span>
                </div>
                <div className="perf-num">{c.num}</div>
                <div className="perf-lbl">{c.lbl}</div>
                <MiniChart bars={c.bars}/>
              </div>
            ))}
          </div>

          <div className="card" style={{padding:0,marginBottom:20,overflow:'hidden'}}>
            <div className="sh-header" style={{padding:'16px 20px'}}>
              <h4>Recent Leads</h4>
              <a className="see-all" style={{cursor:'pointer'}} onClick={()=>navigate('/dashboard?section=leads')}>View all</a>
            </div>
            <div style={{overflowX:'auto'}}>
              <table className="leads-table">
                <thead><tr><th>Customer</th><th>Property</th><th>Budget</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>{LEADS.slice(0,4).map(l=>(
                  <tr key={l.id}>
                    <td><div style={{fontWeight:600,color:'var(--text1)'}}>{l.name}</div><div style={{fontSize:11,color:'var(--text3)'}}>{l.phone}</div></td>
                    <td>{l.property}</td>
                    <td>₹{l.budget}</td>
                    <td style={{fontSize:12,color:'var(--text3)'}}>{l.date}</td>
                    <td><span className={`lead-status ${STATUS_CLASS[l.status]}`}>{STATUS_LABEL[l.status]}</span></td>
                    <td><button className="btn-outline" style={{padding:'4px 10px',fontSize:12}}>Call</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{padding:'0 20px',marginBottom:20}}>
            <div className="sh-header" style={{padding:'16px 0'}}>
              <h4>Active Listings</h4>
              <a className="see-all" style={{cursor:'pointer'}} onClick={()=>navigate('/dashboard?section=listings')}>View all</a>
            </div>
            {PROPERTIES.slice(0,4).map(p=>(
              <div className="listing-row" key={p.id}>
                <div className={`lr-img ${p.color}`}><i className="ti ti-building"></i></div>
                <div className="lr-info"><div className="lr-name">{p.name}</div><div className="lr-loc">{p.loc}</div></div>
                <div style={{textAlign:'right'}}><div className="lr-price">{p.price}</div><div className="lr-views"><i className="ti ti-eye"></i>{p.views}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section==='listings' && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
            <h2 className="dash-heading" style={{margin:0}}>My Listings</h2>
            <button className="btn-navy" style={{padding:'10px 18px'}} onClick={()=>navigate('/dashboard?section=post')}><i className="ti ti-plus"></i> Add New Listing</button>
          </div>
          <div className="grid-auto">{PROPERTIES.map(p=><PropCard key={p.id} p={p}/>)}</div>
        </div>
      )}

      {section==='leads' && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
            <h2 className="dash-heading" style={{margin:0}}>All Leads</h2>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {['All','New','Contacted','Converted','Lost'].map(s=>(
                <button key={s} className="btn-outline" style={{padding:'5px 12px',fontSize:12}}>{s}</button>
              ))}
            </div>
          </div>
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <div style={{overflowX:'auto'}}>
              <table className="leads-table">
                <thead><tr><th>Customer</th><th>Property</th><th>Budget</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{LEADS.map(l=>(
                  <tr key={l.id}>
                    <td><div style={{fontWeight:600,color:'var(--text1)'}}>{l.name}</div><div style={{fontSize:11,color:'var(--text3)'}}>{l.phone}</div></td>
                    <td><div style={{fontWeight:500}}>{l.property}</div><div style={{fontSize:11,color:'var(--text3)'}}>{l.interest}</div></td>
                    <td>₹{l.budget}</td>
                    <td style={{fontSize:12,color:'var(--text3)'}}>{l.date}</td>
                    <td><span className={`lead-status ${STATUS_CLASS[l.status]}`}>{STATUS_LABEL[l.status]}</span></td>
                    <td><div style={{display:'flex',gap:6}}><button className="btn-outline" style={{padding:'4px 10px',fontSize:11}}>Call</button><button className="btn-outline" style={{padding:'4px 10px',fontSize:11}}>Update</button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {section==='post' && <PostPropertySection/>}

      {section==='analytics' && (
        <div>
          <h2 className="dash-heading">Analytics</h2>
          <div className="perf-grid">
            {[
              {icon:'ti-eye',            bg:'pi-blue', num:'4,821', lbl:'Total Views',       trend:'+12%',up:true, bars:[30,45,55,60,55,70,80,65,85,90,75,100]},
              {icon:'ti-user-plus',      bg:'pi-gold', num:'86',    lbl:'New Enquiries',      trend:'+18%',up:true, bars:[20,35,40,30,50,55,60,70,65,80,85,90]},
              {icon:'ti-handshake',      bg:'pi-green',num:'4',     lbl:'Deals Closed',       trend:'+2',  up:true, bars:[10,20,20,30,20,30,40,30,40,50,40,40]},
              {icon:'ti-currency-rupee', bg:'pi-red',  num:'₹8.4L', lbl:'Revenue Generated',  trend:'-2%', up:false,bars:[90,85,80,88,75,80,85,80,75,70,75,70]},
              {icon:'ti-building',       bg:'pi-blue', num:'62',    lbl:'Total Listings',     trend:'+3',  up:true, bars:[55,56,57,58,58,59,60,61,61,62,62,62]},
              {icon:'ti-star',           bg:'pi-gold', num:'4.8',   lbl:'Avg Rating',         trend:'+0.1',up:true, bars:[70,72,74,73,75,76,77,78,78,79,80,80]},
            ].map(c=>(
              <div className="perf-card" key={c.lbl}>
                <div className="perf-card-top">
                  <div className={`perf-icon ${c.bg}`}><i className={`ti ${c.icon}`}></i></div>
                  <span className={`perf-trend ${c.up?'trend-up':'trend-down'}`}><i className={`ti ${c.up?'ti-trending-up':'ti-trending-down'}`}></i>{c.trend}</span>
                </div>
                <div className="perf-num">{c.num}</div>
                <div className="perf-lbl">{c.lbl}</div>
                <MiniChart bars={c.bars}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {section==='agents' && <AgentsSection isFranchise/>}
      {section==='settings' && <SettingsSection user={user} isFranchise/>}
    </>
  );
}

/* ── SHARED ── */
function AgentsSection({ isFranchise }) {
  return (
    <div>
      <h2 className="dash-heading">{isFranchise?'My Team':'Find Expert Agents'}</h2>
      <div className="agent-grid">
        {AGENTS.map(a=>(
          <div className="agent-card" key={a.id}>
            <div className="ag-top">
              <div className="ag-avatar">{a.name.split(' ').map(n=>n[0]).join('')}</div>
              <div><div className="ag-name">{a.name}</div><div className="ag-title">{a.title}</div><div className="ag-city"><i className="ti ti-map-pin" style={{fontSize:12}}></i> {a.city}</div></div>
            </div>
            <div className="ag-stats">
              <div className="ag-stat"><div className="ag-stat-num">{a.listings}</div><div className="ag-stat-lbl">Listings</div></div>
              <div className="ag-stat"><div className="ag-stat-num">{a.deals}</div><div className="ag-stat-lbl">Deals</div></div>
              <div className="ag-stat"><div className="ag-stat-num">{a.exp}</div><div className="ag-stat-lbl">Experience</div></div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn-navy" style={{flex:1,padding:9,fontSize:13}}>Contact</button>
              <button className="btn-outline" style={{flex:1,padding:9,fontSize:13}}>Profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostPropertySection() {
  return (
    <div>
      <h2 className="dash-heading">Post Your Property</h2>
      <div className="step-indicator">
        <div className="step active">1. Basic Info</div><div className="step">2. Location</div>
        <div className="step">3. Details</div><div className="step">4. Photos</div><div className="step">5. Preview</div>
      </div>
      <div className="post-form">
        <div className="form-section">
          <h4>Property Basic Details</h4>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Listing Type</label><select className="form-control"><option>Sell</option><option>Rent</option><option>PG</option></select></div>
            <div className="form-group"><label className="form-label">Property Type</label><select className="form-control"><option>Apartment / Flat</option><option>Villa / Independent House</option><option>Plot / Land</option><option>Office Space</option></select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">BHK Configuration</label><select className="form-control"><option>1 BHK</option><option>2 BHK</option><option>3 BHK</option><option>4 BHK</option></select></div>
            <div className="form-group"><label className="form-label">Expected Price (₹)</label><input type="text" className="form-control" placeholder="e.g. 75,00,000"/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Carpet Area (sq.ft)</label><input type="number" className="form-control" placeholder="e.g. 1200"/></div>
            <div className="form-group"><label className="form-label">Built-up Area (sq.ft)</label><input type="number" className="form-control" placeholder="e.g. 1450"/></div>
          </div>
        </div>
        <div className="form-section">
          <h4>Location</h4>
          <div className="form-row">
            <div className="form-group"><label className="form-label">City</label><select className="form-control"><option>Bengaluru</option><option>Mumbai</option><option>Delhi NCR</option><option>Hyderabad</option><option>Pune</option></select></div>
            <div className="form-group"><label className="form-label">Locality</label><input type="text" className="form-control" placeholder="e.g. Whitefield"/></div>
          </div>
          <div className="form-group"><label className="form-label">Full Address</label><textarea className="form-control" rows="2" placeholder="Building name, street, pincode..."></textarea></div>
        </div>
        <div className="form-section">
          <h4>Status & Possession</h4>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Availability</label><select className="form-control"><option>Ready to Move</option><option>Under Construction</option><option>New Launch</option></select></div>
            <div className="form-group"><label className="form-label">Possession Date</label><input type="month" className="form-control"/></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows="3" placeholder="Describe the property..."></textarea></div>
        </div>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <button className="btn-navy" style={{padding:'13px 28px'}}>Save & Continue →</button>
          <button className="btn-outline" style={{padding:'13px 20px'}}>Save Draft</button>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ user, isFranchise }) {
  return (
    <div>
      <h2 className="dash-heading">Account Settings</h2>
      <div className="post-form">
        <div className="form-section">
          <h4>Personal Information</h4>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-control" defaultValue={user.name}/></div>
            <div className="form-group"><label className="form-label">Phone Number</label><input type="tel" className="form-control" defaultValue={user.phone}/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Email Address</label><input type="email" className="form-control" defaultValue={user.email}/></div>
            <div className="form-group"><label className="form-label">City</label><input type="text" className="form-control" defaultValue={user.city}/></div>
          </div>
          {isFranchise && (
            <div className="form-row">
              <div className="form-group"><label className="form-label">Business Name</label><input type="text" className="form-control" defaultValue={user.businessName}/></div>
              <div className="form-group"><label className="form-label">GSTIN</label><input type="text" className="form-control" defaultValue={user.gstin}/></div>
            </div>
          )}
        </div>
        <div className="form-section">
          <h4>Notification Preferences</h4>
          {[['Email Alerts for new matches',true],['SMS for price drops',true],['WhatsApp updates',false],['Weekly market report',true]].map(([label,state])=>(
            <div key={label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'0.5px solid var(--border)'}}>
              <span style={{fontSize:14,color:'var(--text2)'}}>{label}</span>
              <Toggle initial={state}/>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="btn-navy" style={{padding:'12px 28px'}}>Save Changes</button>
          <Link to="/change-password"><button className="btn-outline" style={{padding:'12px 20px'}}><i className="ti ti-lock"></i> Change Password</button></Link>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN ── */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';
  const MENU = isCustomer ? CUSTOMER_MENU : FRANCHISE_MENU;
  const [section, setSection] = useState('overview');

  useEffect(() => {
    const s = searchParams.get('section');
    if (s && MENU.find(m => m.key === s)) setSection(s);
  }, [searchParams]);

  const initials = user ? user.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : '';

  return (
    <>
      <Navbar />
      <div className="dash-layout">
        <div className="dash-nav">
          <div className="dash-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
            <div className="user-badge">
              <i className={`ti ${isCustomer?'ti-user-check':'ti-building-store'}`} style={{fontSize:12}}></i>
              {isCustomer ? 'Customer' : 'Franchise Partner'}
            </div>
          </div>
          <nav className="dash-menu">
            {MENU.map(m=>(
              <button key={m.key} className={`dm-item ${section===m.key?'active':''}`} onClick={()=>setSection(m.key)}>
                <i className={`ti ${m.icon}`}></i> {m.label}
                {m.key==='saved' && getSaved().length>0 && <span className="dm-badge">{getSaved().length}</span>}
                {m.key==='leads' && <span className="dm-badge">6</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="dash-main">
          {isCustomer
            ? <CustomerDashboard user={user} section={section} setSection={setSection} navigate={navigate}/>
            : <FranchiseDashboard user={user} section={section} navigate={navigate}/>
          }
        </div>
      </div>
      <Footer />
    </>
  );
}
