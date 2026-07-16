import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PropCard from '../components/PropCard.jsx';
import { Spinner, ApiError, EmptyState } from '../components/ApiStatus.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi, useMutation } from '../hooks/useApi.js';
import { gql } from '../lib/gqlClient.js';
import { adaptProperty, adaptProperties } from '../lib/adapt.js';
import {
  DASHBOARD_STATS_QUERY, MY_TENANT_QUERY, MY_PROPERTIES_QUERY,
  SAVED_PROPERTIES_QUERY, MY_LEADS_QUERY, TENANT_LEADS_QUERY,
  MY_SAVED_SEARCHES_QUERY, TOGGLE_SEARCH_ALERT_MUTATION, DELETE_SAVED_SEARCH_MUTATION,
  MY_REVIEWS_QUERY, UPDATE_LEAD_STATUS_MUTATION, UPDATE_PROFILE_MUTATION,
  CREATE_PROPERTY_MUTATION, TENANT_STAFF_QUERY,
} from '../lib/queries.js';

/* ── MENU DEFS ── */
const CUSTOMER_MENU = [
  { key:'overview',   label:'Overview',          icon:'ti-layout-dashboard' },
  { key:'saved',      label:'Saved Properties',  icon:'ti-heart' },
  { key:'enquiries',  label:'My Enquiries',       icon:'ti-message-circle' },
  { key:'alerts',     label:'My Alerts',          icon:'ti-bell' },
  { key:'reviews',    label:'My Reviews',         icon:'ti-star' },
  { key:'agents',     label:'Find Agents',        icon:'ti-users' },
  { key:'settings',   label:'Settings',           icon:'ti-settings' },
];
const FRANCHISE_MENU = [
  { key:'overview',   label:'Dashboard',          icon:'ti-layout-dashboard' },
  { key:'listings',   label:'My Listings',        icon:'ti-building' },
  { key:'leads',      label:'Leads',              icon:'ti-user-star' },
  { key:'post',       label:'Post Property',      icon:'ti-plus-circle' },
  { key:'agents',     label:'My Team',            icon:'ti-users' },
  { key:'settings',   label:'Settings',           icon:'ti-settings' },
];

const LEAD_STATUS = ['NEW','CONTACTED','FOLLOW_UP','CONVERTED','LOST'];
const LEAD_BADGE = { NEW:'ls-new', CONTACTED:'ls-contacted', FOLLOW_UP:'ls-contacted', CONVERTED:'ls-converted', LOST:'ls-lost' };
const LEAD_LABEL = { NEW:'New', CONTACTED:'Contacted', FOLLOW_UP:'Follow-up', CONVERTED:'Converted', LOST:'Lost' };

function Toggle({ initial=false, onChange }) {
  const [on,setOn]=useState(initial);
  return <div className={`toggle ${on?'on':''}`} onClick={()=>{ setOn(v=>!v); onChange && onChange(!on); }}></div>;
}

/* ── CUSTOMER SECTIONS ── */
function CustomerOverview({ user, navigate, savedCount, leads }) {
  const { data: statsData, loading } = useApi(DASHBOARD_STATS_QUERY, {}, { skip: true }); // reserved
  return (
    <div>
      <div className="customer-welcome">
        <div className="cw-avatar">{user.avatar || user.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
        <div className="cw-info">
          <h3>Hi, {user.name?.split(' ')[0]} 👋</h3>
          <p>Here's your property search dashboard</p>
          <div className="cw-tags">
            <span className="cw-tag"><i className="ti ti-user"></i> Customer</span>
            <span className="cw-tag"><i className="ti ti-map-pin"></i> {user.city||'India'}</span>
            <span className="cw-tag"><i className="ti ti-shield-check"></i> Verified</span>
          </div>
        </div>
      </div>
      <div className="stat-cards">
        <div className="stat-card"><div className="sc-num">{savedCount}</div><div className="sc-label">Saved Properties</div></div>
        <div className="stat-card"><div className="sc-num">{leads?.length||0}</div><div className="sc-label">Enquiries Sent</div></div>
        <div className="stat-card"><div className="sc-num">{leads?.filter(l=>l.status==='CONVERTED').length||0}</div><div className="sc-label">Site Visits</div></div>
        <div className="stat-card"><div className="sc-num">3</div><div className="sc-label">Active Alerts</div></div>
      </div>
      <div style={{marginTop:20}}>
        <div className="section-head"><h2 className="section-title" style={{fontSize:18}}>Quick Actions</h2></div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="btn-navy" style={{padding:'10px 18px'}} onClick={()=>navigate('/search')}><i className="ti ti-search"></i> Search Properties</button>
          <button className="btn-outline" style={{padding:'10px 18px'}} onClick={()=>navigate('/map')}><i className="ti ti-map"></i> Map View</button>
        </div>
      </div>
    </div>
  );
}

function SavedPropertiesSection({ navigate }) {
  const { data, loading, error, refetch } = useApi(SAVED_PROPERTIES_QUERY);
  const saved = data?.savedProperties || [];
  if (loading) return <Spinner text="Loading saved properties…" />;
  if (error)   return <ApiError error={error} onRetry={refetch} />;
  return (
    <div>
      <h2 className="dash-heading">Saved Properties</h2>
      {saved.length === 0
        ? <EmptyState icon="ti-heart" title="No saved properties yet"
            description="Browse properties and tap the heart icon to save them here."
            action={<button className="btn-navy" style={{padding:'10px 24px',borderRadius:8}} onClick={()=>navigate('/search')}>Browse Properties</button>}/>
        : <div className="grid-auto">{saved.map(p=>(
            <PropCard key={p.id} p={adaptProperty(p)}/>
          ))}</div>
      }
    </div>
  );
}

function EnquiriesSection() {
  const { data, loading, error, refetch } = useApi(MY_LEADS_QUERY, { pagination:{ page:1, pageSize:20 } });
  const leads = data?.myLeads?.items || [];
  if (loading) return <Spinner text="Loading enquiries…" />;
  if (error)   return <ApiError error={error} onRetry={refetch} />;
  return (
    <div>
      <h2 className="dash-heading">My Enquiries</h2>
      {leads.length===0
        ? <EmptyState icon="ti-message-circle" title="No enquiries yet" description="Contact an agent from any property listing to start a conversation."/>
        : <div className="search-hist">
            <div className="sh-header"><h4>Sent Enquiries ({leads.length})</h4></div>
            {leads.map(l=>(
              <div className="sh-item" key={l.id} style={{flexDirection:'column',alignItems:'flex-start',gap:8}}>
                <div style={{display:'flex',alignItems:'center',gap:10,width:'100%'}}>
                  <div className="sh-icon"><i className="ti ti-building"></i></div>
                  <div style={{flex:1}}>
                    <div className="sh-q">{l.property?.title||'Property'}</div>
                    <div className="sh-meta">{l.property?.city} · {l.assignedTo?.name||'Agent'} · {new Date(l.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <span className={`lead-status ${LEAD_BADGE[l.status]||'ls-new'}`}>{LEAD_LABEL[l.status]||l.status}</span>
                </div>
                {l.message&&<div style={{paddingLeft:50,fontSize:13,color:'var(--text2)',fontStyle:'italic'}}>"{l.message}"</div>}
              </div>
            ))}
          </div>
      }
    </div>
  );
}

function AlertsSection({ user }) {
  const { data, loading, error, refetch } = useApi(MY_SAVED_SEARCHES_QUERY, {}, { skip:!user });
  const [toggleAlert] = useMutation(TOGGLE_SEARCH_ALERT_MUTATION);
  const [deleteAlert] = useMutation(DELETE_SAVED_SEARCH_MUTATION);
  const alerts = data?.mySavedSearches || [];
  if (loading) return <Spinner text="Loading alerts…" />;
  if (error)   return <ApiError error={error} onRetry={refetch} />;
  return (
    <div>
      <h2 className="dash-heading">My Property Alerts</h2>
      <p style={{fontSize:13,color:'var(--text3)',marginBottom:20}}>Get notified when new properties match your criteria.</p>
      {alerts.length===0
        ? <EmptyState icon="ti-bell" title="No alerts set up" description="Save a search with alerts enabled to get notified of new listings."/>
        : alerts.map(a=>(
          <div className="alert-card" key={a.id}>
            <div className="alert-icon"><i className="ti ti-bell"></i></div>
            <div className="alert-info">
              <div className="alert-title">{a.label}</div>
              <div className="alert-desc">{[a.query?.city,a.query?.bhk?.join(', ')].filter(Boolean).join(' · ')}</div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <Toggle initial={a.alertsEnabled} onChange={v=>toggleAlert({id:a.id,enabled:v})}/>
              <button className="btn btn-ghost btn-sm" style={{color:'var(--danger)'}}
                onClick={async()=>{ await deleteAlert({id:a.id}); refetch(); }}>
                <i className="ti ti-trash"></i>
              </button>
            </div>
          </div>
        ))
      }
    </div>
  );
}

function ReviewsSection() {
  const { data, loading, error, refetch } = useApi(MY_REVIEWS_QUERY);
  const reviews = data?.myReviews || [];
  if (loading) return <Spinner text="Loading reviews…" />;
  if (error)   return <ApiError error={error} onRetry={refetch} />;
  const RBADGE = { APPROVED:'badge-success', PENDING:'badge-warning', REJECTED:'badge-danger' };
  return (
    <div>
      <h2 className="dash-heading">My Reviews</h2>
      {reviews.length===0
        ? <EmptyState icon="ti-star" title="No reviews yet" description="After visiting a property, leave a review to help other buyers."/>
        : <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {reviews.map(r=>(
              <div className="card" key={r.id} style={{padding:'16px 20px'}}>
                <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8,marginBottom:8}}>
                  <span style={{fontWeight:600}}>{r.property?.title}</span>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(i=><i key={i} className={`ti ${i<=r.rating?'ti-star-filled':'ti-star'}`} style={{fontSize:14,color:i<=r.rating?'var(--gold)':'var(--border2)'}}></i>)}</div>
                    <span className={`badge ${RBADGE[r.status]||'badge-navy'}`}>{r.status}</span>
                  </div>
                </div>
                <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.6}}>{r.body||r.title}</p>
                <div style={{fontSize:11,color:'var(--text3)',marginTop:6}}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

/* ── FRANCHISE SECTIONS ── */
function FranchiseOverview({ user, tenant, tenantLoading, stats, statsLoading }) {
  return (
    <div>
      <div className="franchise-header">
        <div className="fh-left">
          <h2>Welcome back, {user.name?.split(' ')[0]} 🏢</h2>
          <p>{user.businessName||tenant?.name||'Your Agency'} · {user.city}</p>
          <div className="fh-badge"><i className="ti ti-building-store"></i> Franchise Partner</div>
        </div>
        <div className="fh-stats">
          {tenantLoading
            ? [1,2,3,4].map(i=><div key={i} className="fh-stat"><div className="fh-stat-num">—</div><div className="fh-stat-lbl">…</div></div>)
            : (<>
                <div className="fh-stat"><div className="fh-stat-num">{tenant?.listingCount||0}</div><div className="fh-stat-lbl">Listings</div></div>
                <div className="fh-stat"><div className="fh-stat-num">{tenant?.activeLeadCount||0}</div><div className="fh-stat-lbl">Leads</div></div>
                <div className="fh-stat"><div className="fh-stat-num">{tenant?.staffCount||0}</div><div className="fh-stat-lbl">Staff</div></div>
                <div className="fh-stat"><div className="fh-stat-num">{tenant?.plan?.commissionPercent||4}%</div><div className="fh-stat-lbl">Commission</div></div>
              </>)
          }
        </div>
      </div>
      <div className="stat-cards">
        <div className="stat-card"><div className="sc-num">{tenant?.listingCount||0}</div><div className="sc-label">Active Listings</div></div>
        <div className="stat-card"><div className="sc-num">{tenant?.activeLeadCount||0}</div><div className="sc-label">Active Leads</div></div>
        <div className="stat-card"><div className="sc-num">{tenant?.staffCount||0}</div><div className="sc-label">Team Members</div></div>
        <div className="stat-card"><div className="sc-num">{tenant?.plan?.name||'Starter'}</div><div className="sc-label">Current Plan</div></div>
      </div>
    </div>
  );
}

function MyListingsSection({ navigate }) {
  const { data, loading, error, refetch } = useApi(MY_PROPERTIES_QUERY, { pagination:{ page:1,pageSize:20 } });
  const items = data?.myProperties?.items || [];
  if (loading) return <Spinner text="Loading listings…" />;
  if (error)   return <ApiError error={error} onRetry={refetch} />;
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <h2 className="dash-heading" style={{margin:0}}>My Listings</h2>
        <button className="btn-navy" style={{padding:'10px 18px'}} onClick={()=>navigate('/dashboard?section=post')}>
          <i className="ti ti-plus"></i> Add New Listing
        </button>
      </div>
      {items.length===0
        ? <EmptyState icon="ti-building" title="No listings yet" description="Start by posting your first property."
            action={<button className="btn-navy" style={{padding:'10px 24px',borderRadius:8}} onClick={()=>navigate('/dashboard?section=post')}>Post Property</button>}/>
        : <div className="grid-auto">{items.map(p=>(
            <PropCard key={p.id} p={adaptProperty(p)}/>
          ))}</div>
      }
    </div>
  );
}

function LeadsSection() {
  const { data, loading, error, refetch } = useApi(TENANT_LEADS_QUERY, { pagination:{ page:1,pageSize:50 } });
  const [updateStatus] = useMutation(UPDATE_LEAD_STATUS_MUTATION);
  const leads = data?.tenantLeads?.items || [];

  async function changeStatus(id, status) {
    try {
      await updateStatus({ id, status });
      refetch();
    } catch(e) { console.error(e); }
  }

  if (loading) return <Spinner text="Loading leads…" />;
  if (error)   return <ApiError error={error} onRetry={refetch} />;
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <h2 className="dash-heading" style={{margin:0}}>All Leads <span style={{fontSize:14,color:'var(--text3)',fontWeight:400}}>({leads.length})</span></h2>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {['All','NEW','CONTACTED','CONVERTED','LOST'].map(s=>(
            <button key={s} className="btn-outline" style={{padding:'5px 12px',fontSize:12}}>{s.charAt(0)+s.slice(1).toLowerCase()}</button>
          ))}
        </div>
      </div>
      {leads.length===0
        ? <EmptyState icon="ti-user-search" title="No leads yet" description="Leads from your property listings will appear here."/>
        : <div className="card" style={{padding:0,overflow:'hidden'}}>
            <div style={{overflowX:'auto'}}>
              <table className="leads-table">
                <thead><tr><th>Customer</th><th>Property</th><th>Budget</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{leads.map(l=>(
                  <tr key={l.id}>
                    <td>
                      <div style={{fontWeight:600,color:'var(--text1)'}}>{l.contactName}</div>
                      <div style={{fontSize:11,color:'var(--text3)'}}>{l.contactPhone}</div>
                    </td>
                    <td>
                      <div style={{fontWeight:500}}>{l.property?.title||'—'}</div>
                      <div style={{fontSize:11,color:'var(--text3)'}}>{l.property?.city}</div>
                    </td>
                    <td>{l.budgetLabel||'—'}</td>
                    <td style={{fontSize:12,color:'var(--text3)'}}>{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <select className={`lead-status ${LEAD_BADGE[l.status]||'ls-new'}`}
                        value={l.status} onChange={e=>changeStatus(l.id,e.target.value)}
                        style={{border:'none',cursor:'pointer',fontWeight:600,fontSize:11,background:'transparent'}}>
                        {LEAD_STATUS.map(s=><option key={s} value={s}>{LEAD_LABEL[s]}</option>)}
                      </select>
                    </td>
                    <td>
                      <a href={`tel:${l.contactPhone}`} className="btn-outline" style={{padding:'4px 10px',fontSize:12,borderRadius:6}}>Call</a>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
      }
    </div>
  );
}

function PostPropertySection() {
  const [form, setForm] = useState({ listingType:'SALE', propertyType:'APARTMENT', bhk:'2_BHK', price:'', carpetArea:'', city:'Bengaluru', locality:'', status:'UNDER_CONSTRUCTION', description:'' });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.price || !form.city || !form.locality) { setError('Please fill all required fields.'); return; }
    setSubmitting(true); setError('');
    try {
      await gql(CREATE_PROPERTY_MUTATION, {
        input: {
          title: `${form.bhk.replace('_',' ')} ${form.propertyType.charAt(0)+form.propertyType.slice(1).toLowerCase()} in ${form.locality}`,
          propertyType: form.propertyType,
          bhkConfig: form.bhk,
          listingType: form.listingType,
          pricePaise: Math.round(parseFloat(form.price.replace(/,/g,'')) * 100),
          carpetAreaSqft: form.carpetArea ? parseInt(form.carpetArea) : undefined,
          city: form.city,
          locality: form.locality,
          status: form.status,
          description: form.description,
        }
      });
      setSuccess(true);
    } catch(e) { setError(e.message || 'Failed to post property.'); }
    finally { setSubmitting(false); }
  }

  if (success) return (
    <div className="post-form">
      <div style={{textAlign:'center',padding:'40px 20px'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'var(--success-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,color:'var(--success)',margin:'0 auto 16px'}}>
          <i className="ti ti-check"></i>
        </div>
        <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,marginBottom:8}}>Property Submitted!</h3>
        <p style={{fontSize:14,color:'var(--text3)'}}>Your listing is under review and will go live within 24 hours.</p>
        <button className="btn-navy" style={{marginTop:20,padding:'10px 24px',borderRadius:8}} onClick={()=>setSuccess(false)}>Post Another</button>
      </div>
    </div>
  );

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <div>
      <h2 className="dash-heading">Post Your Property</h2>
      <div className="step-indicator">
        {['Basic Info','Location','Details','Photos','Preview'].map((s,i)=>(
          <div key={s} className={`step ${step===i+1?'active':step>i+1?'done':''}`}>{i+1}. {s}</div>
        ))}
      </div>
      <div className="post-form">
        {error && <div className="form-error" style={{marginBottom:16}}><i className="ti ti-alert-circle"></i> {error}</div>}
        <form onSubmit={handleSubmit}>
          {step===1 && (
            <div className="form-section">
              <h4>Property Basic Details</h4>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Listing Type</label>
                  <select className="form-control" value={form.listingType} onChange={e=>set('listingType',e.target.value)}>
                    <option value="SALE">Sell</option><option value="RENT">Rent</option><option value="PG">PG</option>
                  </select></div>
                <div className="form-group"><label className="form-label">Property Type</label>
                  <select className="form-control" value={form.propertyType} onChange={e=>set('propertyType',e.target.value)}>
                    <option value="APARTMENT">Apartment / Flat</option><option value="VILLA">Villa</option>
                    <option value="PLOT">Plot / Land</option><option value="COMMERCIAL">Office / Commercial</option>
                  </select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">BHK Configuration</label>
                  <select className="form-control" value={form.bhk} onChange={e=>set('bhk',e.target.value)}>
                    <option value="1_BHK">1 BHK</option><option value="2_BHK">2 BHK</option>
                    <option value="3_BHK">3 BHK</option><option value="4_BHK">4 BHK</option><option value="STUDIO">Studio</option>
                  </select></div>
                <div className="form-group"><label className="form-label">Expected Price (₹)</label>
                  <input type="text" className="form-control" placeholder="e.g. 75,00,000" value={form.price} onChange={e=>set('price',e.target.value)}/></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Carpet Area (sq.ft)</label>
                  <input type="number" className="form-control" placeholder="e.g. 1200" value={form.carpetArea} onChange={e=>set('carpetArea',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Possession Status</label>
                  <select className="form-control" value={form.status} onChange={e=>set('status',e.target.value)}>
                    <option value="READY_TO_MOVE">Ready to Move</option><option value="UNDER_CONSTRUCTION">Under Construction</option>
                  </select></div>
              </div>
              <button type="button" className="btn-navy" style={{padding:'12px 24px'}} onClick={()=>setStep(2)}>Continue →</button>
            </div>
          )}
          {step===2 && (
            <div className="form-section">
              <h4>Location Details</h4>
              <div className="form-row">
                <div className="form-group"><label className="form-label">City *</label>
                  <select className="form-control" value={form.city} onChange={e=>set('city',e.target.value)}>
                    {['Bengaluru','Mumbai','Delhi NCR','Hyderabad','Pune','Chennai','Gurugram','Ahmedabad'].map(c=><option key={c}>{c}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Locality *</label>
                  <input type="text" className="form-control" placeholder="e.g. Whitefield" value={form.locality} onChange={e=>set('locality',e.target.value)}/></div>
              </div>
              <div className="form-group"><label className="form-label">Description</label>
                <textarea className="form-control" rows="4" placeholder="Describe the property, amenities, connectivity..." value={form.description} onChange={e=>set('description',e.target.value)}></textarea></div>
              <div style={{display:'flex',gap:10}}>
                <button type="button" className="btn-outline" style={{padding:'12px 20px'}} onClick={()=>setStep(1)}>← Back</button>
                <button type="submit" className="btn-navy" style={{padding:'12px 28px'}} disabled={submitting}>
                  {submitting?'Submitting…':'Submit Listing'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function AgentsSection({ isFranchise }) {
  const { data, loading, error, refetch } = useApi(TENANT_STAFF_QUERY, {}, { skip:!isFranchise });
  const staff = data?.tenantStaff || [];
  if (loading) return <Spinner text="Loading team…" />;
  if (error)   return <ApiError error={error} onRetry={refetch} />;
  if (!isFranchise || staff.length===0) return (
    <div>
      <h2 className="dash-heading">{isFranchise?'My Team':'Find Expert Agents'}</h2>
      <EmptyState icon="ti-users" title={isFranchise?'No team members yet':'Agents coming soon'} description={isFranchise?'Invite staff members to collaborate on listings and leads.':'Our verified agent directory will be available soon.'}/>
    </div>
  );
  return (
    <div>
      <h2 className="dash-heading">My Team ({staff.length})</h2>
      <div className="agent-grid">
        {staff.map(a=>(
          <div className="agent-card" key={a.id}>
            <div className="ag-top">
              <div className="ag-avatar">{a.name.split(' ').map(n=>n[0]).join('')}</div>
              <div>
                <div className="ag-name">{a.name}</div>
                <div className="ag-title">{a.role}</div>
                <div className="ag-city"><i className="ti ti-circle" style={{fontSize:10,color:a.isActive?'var(--success)':'var(--text3)'}}></i> {a.isActive?'Active':'Inactive'}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <a href={`mailto:${a.email}`} className="btn-outline" style={{flex:1,padding:9,fontSize:13,textAlign:'center',borderRadius:8}}>Email</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsSection({ user, updateUser }) {
  const [form, setForm] = useState({ name:user.name||'', phone:user.phone||'', city:user.city||'', businessName:user.businessName||'', gstin:user.gstin||'' });
  const [updateProfile] = useMutation(UPDATE_PROFILE_MUTATION);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      // updateProfile takes flat args (name, phone, city) not an input object
      const data = await updateProfile({ name: form.name, phone: form.phone, city: form.city });
      // Merge returned fields back into user, keeping existing avatar
      updateUser({ ...data.updateProfile, avatar: data.updateProfile.avatarUrl || user.avatar });
      setSaved(true);
      setTimeout(()=>setSaved(false), 3000);
    } catch(e) { setError(e.message||'Failed to save.'); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <h2 className="dash-heading">Account Settings</h2>
      <div className="post-form">
        {saved && <div className="form-success" style={{marginBottom:16}}><i className="ti ti-check"></i> Profile updated successfully!</div>}
        {error && <div className="form-error" style={{marginBottom:16}}><i className="ti ti-alert-circle"></i> {error}</div>}
        <form onSubmit={handleSave}>
          <div className="form-section">
            <h4>Personal Information</h4>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={form.name} onChange={e=>set('name',e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Phone Number</label><input className="form-control" value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={user.email} readOnly style={{background:'var(--bg)',cursor:'not-allowed'}}/></div>
              <div className="form-group"><label className="form-label">City</label>
                <select className="form-control" value={form.city} onChange={e=>set('city',e.target.value)}>
                  {['Bengaluru','Mumbai','Delhi NCR','Hyderabad','Pune','Chennai','Gurugram','Ahmedabad'].map(c=><option key={c}>{c}</option>)}
                </select></div>
            </div>
            {user.role==='franchise'&&(
              <div className="form-row">
                <div className="form-group"><label className="form-label">Business Name</label><input className="form-control" value={form.businessName} onChange={e=>set('businessName',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">GSTIN</label><input className="form-control" value={form.gstin} onChange={e=>set('gstin',e.target.value)}/></div>
              </div>
            )}
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <button type="submit" className="btn-navy" style={{padding:'12px 28px'}} disabled={saving}>{saving?'Saving…':'Save Changes'}</button>
            <Link to="/change-password"><button type="button" className="btn-outline" style={{padding:'12px 20px'}}><i className="ti ti-lock"></i> Change Password</button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── MAIN DASHBOARD ── */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuth();
  const isCustomer = user?.role === 'customer' || user?.role === 'CUSTOMER';
  const MENU = isCustomer ? CUSTOMER_MENU : FRANCHISE_MENU;
  const [section, setSection] = useState('overview');

  // Tenant data for franchise
  const { data: tenantData, loading: tenantLoading } = useApi(
    MY_TENANT_QUERY, {}, { skip: isCustomer }
  );
  const tenant = tenantData?.myTenant;

  // Leads for customer overview badge
  const { data: myLeadsData } = useApi(
    MY_LEADS_QUERY, { pagination:{ page:1,pageSize:5 } }, { skip: !isCustomer }
  );
  const savedCount = 0; // optimistic — updated by SavedPropertiesSection

  useEffect(() => {
    const s = searchParams.get('section');
    if (s && MENU.find(m => m.key === s)) setSection(s);
  }, [searchParams]);

  const initials = user ? user.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : '';

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="dash-layout">
        {/* SIDEBAR */}
        <div className="dash-nav">
          <div className="dash-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
            <div className="user-badge">
              <i className={`ti ${isCustomer?'ti-user-check':'ti-building-store'}`} style={{fontSize:12}}></i>
              {isCustomer ? 'Customer' : 'Franchise Partner'}
            </div>
          </div>
          <nav className="dash-menu">
            {MENU.map(m=>(
              <button key={m.key} className={`dm-item ${section===m.key?'active':''}`} onClick={()=>setSection(m.key)}>
                <i className={`ti ${m.icon}`}></i> {m.label}
              </button>
            ))}
          </nav>
        </div>

        {/* MAIN */}
        <div className="dash-main">
          {/* CUSTOMER */}
          {isCustomer && section==='overview'   && <CustomerOverview user={user} navigate={navigate} savedCount={savedCount} leads={myLeadsData?.myLeads?.items}/>}
          {isCustomer && section==='saved'       && <SavedPropertiesSection navigate={navigate}/>}
          {isCustomer && section==='enquiries'   && <EnquiriesSection/>}
          {isCustomer && section==='alerts'      && <AlertsSection user={user}/>}
          {isCustomer && section==='reviews'     && <ReviewsSection/>}
          {isCustomer && section==='agents'      && <AgentsSection isFranchise={false}/>}
          {isCustomer && section==='settings'    && <SettingsSection user={user} updateUser={updateUser}/>}

          {/* FRANCHISE */}
          {!isCustomer && section==='overview'  && <FranchiseOverview user={user} tenant={tenant} tenantLoading={tenantLoading} stats={null} statsLoading={false}/>}
          {!isCustomer && section==='listings'  && <MyListingsSection navigate={navigate}/>}
          {!isCustomer && section==='leads'     && <LeadsSection/>}
          {!isCustomer && section==='post'      && <PostPropertySection/>}
          {!isCustomer && section==='agents'    && <AgentsSection isFranchise={true}/>}
          {!isCustomer && section==='settings'  && <SettingsSection user={user} updateUser={updateUser}/>}
        </div>
      </div>
      <Footer />
    </>
  );
}
