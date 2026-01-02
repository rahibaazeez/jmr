import { useState, useMemo } from 'react';
import { supabase } from './supabaseClient';

const initialComponentDetail = {
  coreComponent: '',
  subApplication: '',
  versionDetails: '',
  vcpu: '',
  ram: '',
  storage: ''
};

const initialFormState = {
  clientName: '',
  // Stack 1
  componentType: '',
  product: '',
  version: '',
  patch: '',
  certified: '',
  supportStatus: '',
  notes: '',
  // Stack 2
  componentType_2: '',
  product_2: '',
  version_2: '',
  patch_2: '',
  certified_2: '',
  supportStatus_2: '',
  notes_2: '',
  // Stack 3
  componentType_3: '',
  product_3: '',
  version_3: '',
  patch_3: '',
  certified_3: '',
  supportStatus_3: '',
  notes_3: '',
  // Other

  componentDetails: [{ ...initialComponentDetail }]
};

const COMPONENT_TYPES = [
  "Operating System",
  "Database",
  "Middleware"
];

const CORE_COMPONENTS = [
  "OFSAA Infrastructure & Framework Components",
  "Risk Management Applications",
  "Finance & Regulatory Reporting"
];

const STACK_DEPENDENCIES = {
  "Operating System": {
    products: ["Oracle Linux", "Oracle Solari", "RHEL", "IBM AIX", "Windows Server", "SUSE Linux", "macOS"],
    versions: ["7.x", "8.x", "9.x"],
    patches: ["Latest UEK"]
  }
  // Database and Middleware have no predefined options in the source file currently
};

const CORE_SUB_APPLICATIONS = {
  "OFSAA Infrastructure & Framework Components": [
    "OFSAA Infrastructure (OFSAAI)",
    "OFSAA Framework Services",
    "Metadata Management",
    "Security & User Management",
    "Data Management Framework",
    "Batch Processing & Scheduler",
    "Log Management & Audit Framework"
  ],
  "Risk Management Applications": [
    "Oracle Financial Services Credit Risk Analytics (CRR)",
    "Oracle Financial Services Probability of Default (PD)",
    "Loss Given Default (LGD)",
    "Exposure at Default (EAD)",
    "Expected Credit Loss (ECL / IFRS 9 / CECL)",
    "Stress Testing",
    "Liquidity Risk Management",
    "Market Risk Analytics"
  ]
};

const CERTIFIED_OPTIONS = ["Yes", "No", "Conditional"];
const SUPPORT_STATUS_OPTIONS = ["Extended / Sustaining", "Premier"];

function App() {
  const [formData, setFormData] = useState(initialFormState);
  const [notification, setNotification] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Reset child fields if parent changes
      if (name === 'componentType') {
        newData.product = ''; newData.version = ''; newData.patch = '';
      }
      if (name === 'componentType_2') {
        newData.product_2 = ''; newData.version_2 = ''; newData.patch_2 = '';
      }
      if (name === 'componentType_3') {
        newData.product_3 = ''; newData.version_3 = ''; newData.patch_3 = '';
      }
      return newData;
    });
  };

  const handleComponentChange = (index, field, value) => {
    setFormData(prev => {
      const newComponents = [...prev.componentDetails];
      newComponents[index] = { ...newComponents[index], [field]: value };

      // Reset subApplication if coreComponent changes
      if (field === 'coreComponent') {
        newComponents[index].subApplication = '';
      }

      return { ...prev, componentDetails: newComponents };
    });
  };

  const addComponent = () => {
    setFormData(prev => ({
      ...prev,
      componentDetails: [...prev.componentDetails, { ...initialComponentDetail }]
    }));
  };

  const removeComponent = (index) => {
    setFormData(prev => {
      if (prev.componentDetails.length <= 1) return prev;
      const newComponents = prev.componentDetails.filter((_, i) => i !== index);
      return { ...prev, componentDetails: newComponents };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sanitizedClient = formData.clientName.replace(/[^a-zA-Z0-9-_]/g, '');

      // Fetch all existing IDs to determine the next global sequence number
      const { data: existingIds, error: fetchError } = await supabase
        .from('stack')
        .select('id');

      if (fetchError) throw fetchError;

      let nextIndex = 1;
      const prefix = sanitizedClient ? `${sanitizedClient}_` : '';

      if (existingIds && existingIds.length > 0) {
        const clientIds = existingIds
          .map(row => row.id)
          .filter(id => id && id.toString().startsWith(prefix));

        const counts = clientIds
          .map(id => {
            const parts = id.split('_');
            const lastPart = parts[parts.length - 1];
            const num = parseInt(lastPart, 10);
            return isNaN(num) ? 0 : num;
          });

        if (counts.length > 0) {
          nextIndex = Math.max(...counts) + 1;
        }
      }

      const insertSafe = async (table, data) => {
        const { data: sampleRows } = await supabase.from(table).select('*').limit(1);
        let payload = { ...data };

        if (sampleRows && sampleRows.length > 0) {
          const validColumns = Object.keys(sampleRows[0]);
          const filtered = {};
          Object.keys(payload).forEach(key => {
            if (validColumns.includes(key)) filtered[key] = payload[key];
          });
          payload = filtered;
        }

        console.log(`Inserting into ${table}:`, payload);
        const { error } = await supabase.from(table).insert([payload]);
        if (error) throw error;
      };

      // 1. Prepare Stack Payloads
      const stacks = [
        { suffix: '', data: { componentType: formData.componentType, product: formData.product, version: formData.version, patch: formData.patch, certified: formData.certified, supportStatus: formData.supportStatus, notes: formData.notes } },
        { suffix: '_2', data: { componentType: formData['componentType_2'], product: formData['product_2'], version: formData['version_2'], patch: formData['patch_2'], certified: formData['certified_2'], supportStatus: formData['supportStatus_2'], notes: formData['notes_2'] } },
        { suffix: '_3', data: { componentType: formData['componentType_3'], product: formData['product_3'], version: formData['version_3'], patch: formData['patch_3'], certified: formData['certified_3'], supportStatus: formData['supportStatus_3'], notes: formData['notes_3'] } }
      ];

      let currentIdIndex = nextIndex;

      for (const stack of stacks) {
        if (!stack.data.componentType) continue;

        const thisId = `${prefix}${currentIdIndex}`;

        const stackPayload = {
          id: thisId,
          clientName: formData.clientName,
          ...stack.data
        };

        await insertSafe('stack', stackPayload);
        currentIdIndex++;
      }

      // 2. Insert into Component Details Table for ALL components
      // All components are linked to the PRIMARY ID (first stack ID)
      const primaryId = `${prefix}${nextIndex}`;

      for (const detail of formData.componentDetails) {
        // Skip empty entries if needed? Logic below inserts whatever is there.
        const detailsPayload = {
          id: primaryId,
          coreComponent: detail.coreComponent,
          subApplication: detail.subApplication,
          versionDetails: detail.versionDetails,
          vcpu: detail.vcpu,
          ram: detail.ram,
          storage: detail.storage
        };

        try {
          await insertSafe('component', detailsPayload);
        } catch (detailError) {
          console.warn('Could not insert into details table:', detailError);
        }
      }

      showNotification(`Record created `, 'success');
      setFormData(initialFormState); // Reset form
    } catch (error) {
      console.error('Error saving record:', error);
      showNotification('Error saving record', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Helper to render input or select based on availability of options
  const renderField = (label, name, value, options = [], onChange) => {
    return (
      <div>
        <label>{label}</label>
        {options && options.length > 0 ? (
          <select name={name} value={value} onChange={onChange}>
            <option value="">Select...</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input name={name} value={value} onChange={onChange} />
        )}
      </div>
    );
  };

  // Helpers getting options for specific stack
  const getStackOptions = (compType) => STACK_DEPENDENCIES[compType] || {};

  return (
    <div className="app-container">
      {notification && (
        <div className={`notification ${notification.type}`} style={{
          position: 'fixed', top: '20px', right: '20px',
          background: notification.type === 'error' ? '#ef4444' : '#10b981',
          color: 'white', padding: '1rem', borderRadius: '8px', zIndex: 1000
        }}>
          {notification.message}
        </div>
      )}

      <header className="title-bar">
        <div>
          <h1>OFSAA Supported Stack</h1>
          <p style={{ color: 'var(--text-muted)' }}>Add new stack and component data efficiently.</p>
        </div>
      </header>

      <div className="glass-panel">
        <h2 style={{ marginBottom: '1.5rem' }}>Add New Record</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Client Name</label>
            <input name="clientName" value={formData.clientName} onChange={handleInputChange} placeholder="e.g. Client X" autoFocus />
          </div>

          {[
            { suffix: '', label: 'Stack Information' },
            { suffix: '_2', label: 'Stack Information' },
            { suffix: '_3', label: 'Stack Information' }
          ].map((stack, idx) => {
            const compType = formData[`componentType${stack.suffix}`];
            const opts = getStackOptions(compType);

            return (
              <div key={stack.suffix}>
                <h3 style={{ marginTop: '1rem', fontSize: '1.2rem', color: 'var(--primary-color)' }}>{stack.label}</h3>
                <div className="form-grid">
                  <div>
                    <label>Component Type</label>
                    <select name={`componentType${stack.suffix}`} value={formData[`componentType${stack.suffix}`]} onChange={handleInputChange}>
                      <option value="">Select Component Type...</option>
                      {COMPONENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  {renderField('Product', `product${stack.suffix}`, formData[`product${stack.suffix}`], opts.products, handleInputChange)}
                  {renderField('Version', `version${stack.suffix}`, formData[`version${stack.suffix}`], opts.versions, handleInputChange)}
                  {renderField('Patch / PSU/RU', `patch${stack.suffix}`, formData[`patch${stack.suffix}`], opts.patches, handleInputChange)}

                  <div>
                    <label>Certified</label>
                    <select name={`certified${stack.suffix}`} value={formData[`certified${stack.suffix}`]} onChange={handleInputChange}>
                      <option value="">Select...</option>
                      {CERTIFIED_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Support Status</label>
                    <select name={`supportStatus${stack.suffix}`} value={formData[`supportStatus${stack.suffix}`]} onChange={handleInputChange}>
                      <option value="">Select...</option>
                      {SUPPORT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <label>Notes</label>
                  <input name={`notes${stack.suffix}`} value={formData[`notes${stack.suffix}`]} onChange={handleInputChange} placeholder="Notes..." />
                </div>
              </div>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-color)', margin: 0 }}>Component Details</h3>
            <button type="button" onClick={addComponent} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              + Add Another Component
            </button>
          </div>

          {formData.componentDetails.map((component, index) => (
            <div key={index} style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', marginTop: '1rem', position: 'relative' }}>
              {formData.componentDetails.length > 1 && (
                <button type="button" onClick={() => removeComponent(index)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Remove
                </button>
              )}
              <div className="form-grid">
                <div>
                  <label>Core Component</label>
                  <select value={component.coreComponent} onChange={(e) => handleComponentChange(index, 'coreComponent', e.target.value)}>
                    <option value="">Select Core Component...</option>
                    {CORE_COMPONENTS.map(comp => <option key={comp} value={comp}>{comp}</option>)}
                  </select>
                </div>

                {renderField('Sub Application', 'subApplication', component.subApplication, CORE_SUB_APPLICATIONS[component.coreComponent], (e) => handleComponentChange(index, 'subApplication', e.target.value))}

                <div>
                  <label>Version Details</label>
                  <input value={component.versionDetails} onChange={(e) => handleComponentChange(index, 'versionDetails', e.target.value)} />
                </div>
                <div>
                  <label>vCPU</label>
                  <input value={component.vcpu} onChange={(e) => handleComponentChange(index, 'vcpu', e.target.value)} />
                </div>
                <div>
                  <label>RAM</label>
                  <input value={component.ram} onChange={(e) => handleComponentChange(index, 'ram', e.target.value)} />
                </div>
                <div>
                  <label>Storage</label>
                  <input value={component.storage} onChange={(e) => handleComponentChange(index, 'storage', e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <div className="action-bar" style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn-primary">
              Save All Records
            </button>
            <button type="button" className="btn-secondary" onClick={() => setFormData(initialFormState)}>
              Reset
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

export default App;
