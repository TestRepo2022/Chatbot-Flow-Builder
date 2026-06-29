import { useFlowStore } from '../../store/flowStore';
import { getNodeConfig } from '../../lib/nodeConfig';
import { X, Plus, Trash2 } from 'lucide-react';

function FieldRow({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, multiline }) {
  const cls = "w-full px-3 py-2 text-xs rounded-lg outline-none transition-all resize-none";
  const style = { background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' };
  if (multiline) {
    return <textarea rows={3} className={cls} style={style} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
  }
  return <input type="text" className={cls} style={style} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      className="w-full px-3 py-2 text-xs rounded-lg outline-none"
      style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function AddButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-dashed transition-colors hover:bg-primary/10"
      style={{ borderColor: 'hsl(var(--primary) / 0.4)', color: 'hsl(var(--primary))' }}
    >
      <Plus size={12} /> {label}
    </button>
  );
}

function RemoveButton({ onClick }) {
  return (
    <button onClick={onClick} className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
      <Trash2 size={12} />
    </button>
  );
}

function TextMessageProps({ data, update }) {
  return (
    <div className="space-y-4">
      <FieldRow label="Label">
        <TextInput value={data.label} onChange={(v) => update({ label: v })} placeholder="Node label" />
      </FieldRow>
      <FieldRow label="Message">
        <TextInput value={data.message} onChange={(v) => update({ message: v })} placeholder="Type your message... Use {{variable}} for placeholders" multiline />
      </FieldRow>
      <FieldRow label="Variables">
        <div className="space-y-1.5">
          {(data.variables || []).map((v, i) => (
            <div key={i} className="flex gap-2">
              <TextInput value={v} onChange={(val) => {
                const vars = [...(data.variables || [])];
                vars[i] = val;
                update({ variables: vars });
              }} placeholder="variable_name" />
              <RemoveButton onClick={() => {
                const vars = (data.variables || []).filter((_, idx) => idx !== i);
                update({ variables: vars });
              }} />
            </div>
          ))}
          <AddButton label="Add Variable" onClick={() => update({ variables: [...(data.variables || []), ''] })} />
        </div>
      </FieldRow>
    </div>
  );
}

function MediaMessageProps({ data, update }) {
  return (
    <div className="space-y-4">
      <FieldRow label="Label"><TextInput value={data.label} onChange={(v) => update({ label: v })} /></FieldRow>
      <FieldRow label="Media Type">
        <SelectInput value={data.mediaType} onChange={(v) => update({ mediaType: v })} options={[
          { value: 'image', label: 'Image' },
          { value: 'video', label: 'Video' },
          { value: 'audio', label: 'Audio' },
          { value: 'document', label: 'Document' },
        ]} />
      </FieldRow>
      <FieldRow label="URL"><TextInput value={data.url} onChange={(v) => update({ url: v })} placeholder="https://..." /></FieldRow>
      <FieldRow label="Caption"><TextInput value={data.caption} onChange={(v) => update({ caption: v })} placeholder="Optional caption" multiline /></FieldRow>
    </div>
  );
}

function QuickReplyProps({ data, update }) {
  const buttons = data.buttons || [];
  return (
    <div className="space-y-4">
      <FieldRow label="Label"><TextInput value={data.label} onChange={(v) => update({ label: v })} /></FieldRow>
      <FieldRow label="Message"><TextInput value={data.message} onChange={(v) => update({ message: v })} placeholder="Message text" multiline /></FieldRow>
      <FieldRow label="Buttons">
        <div className="space-y-2">
          {buttons.map((btn, i) => (
            <div key={btn.id} className="flex gap-2 items-center">
              <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0" style={{ background: 'hsl(var(--muted))' }}>{i + 1}</div>
              <TextInput value={btn.text} onChange={(v) => {
                const btns = [...buttons];
                btns[i] = { ...btn, text: v };
                update({ buttons: btns });
              }} placeholder={`Button ${i + 1} label`} />
              <RemoveButton onClick={() => update({ buttons: buttons.filter((_, idx) => idx !== i) })} />
            </div>
          ))}
          {buttons.length < 3 && (
            <AddButton label="Add Button" onClick={() => update({ buttons: [...buttons, { id: `btn_${Date.now()}`, text: '' }] })} />
          )}
          {buttons.length >= 3 && <p className="text-[10px] text-muted-foreground">Maximum 3 buttons</p>}
        </div>
      </FieldRow>
    </div>
  );
}

function ListMessageProps({ data, update }) {
  const sections = data.sections || [];
  return (
    <div className="space-y-4">
      <FieldRow label="Label"><TextInput value={data.label} onChange={(v) => update({ label: v })} /></FieldRow>
      <FieldRow label="Header"><TextInput value={data.header} onChange={(v) => update({ header: v })} placeholder="List header" /></FieldRow>
      <FieldRow label="Body"><TextInput value={data.body} onChange={(v) => update({ body: v })} placeholder="List body text" multiline /></FieldRow>
      <FieldRow label="Footer"><TextInput value={data.footer} onChange={(v) => update({ footer: v })} placeholder="Footer text" /></FieldRow>
      <FieldRow label="Button Text"><TextInput value={data.buttonText} onChange={(v) => update({ buttonText: v })} placeholder="Choose an option" /></FieldRow>
      <FieldRow label="Sections">
        <div className="space-y-3">
          {sections.map((sec, si) => (
            <div key={si} className="rounded-lg p-3 space-y-2" style={{ background: 'hsl(var(--muted) / 0.3)', border: '1px solid hsl(var(--border))' }}>
              <div className="flex gap-2">
                <TextInput value={sec.title} onChange={(v) => {
                  const secs = [...sections];
                  secs[si] = { ...sec, title: v };
                  update({ sections: secs });
                }} placeholder="Section title" />
                <RemoveButton onClick={() => update({ sections: sections.filter((_, idx) => idx !== si) })} />
              </div>
              {(sec.rows || []).map((row, ri) => (
                <div key={ri} className="flex gap-2 pl-2">
                  <div className="flex-1 space-y-1">
                    <TextInput value={row.title} onChange={(v) => {
                      const secs = [...sections];
                      secs[si].rows[ri] = { ...row, title: v };
                      update({ sections: secs });
                    }} placeholder="Row title" />
                    <TextInput value={row.description} onChange={(v) => {
                      const secs = [...sections];
                      secs[si].rows[ri] = { ...row, description: v };
                      update({ sections: secs });
                    }} placeholder="Row description (optional)" />
                  </div>
                  <RemoveButton onClick={() => {
                    const secs = [...sections];
                    secs[si].rows = secs[si].rows.filter((_, idx) => idx !== ri);
                    update({ sections: secs });
                  }} />
                </div>
              ))}
              <button
                onClick={() => {
                  const secs = [...sections];
                  secs[si].rows = [...(sec.rows || []), { id: `row_${Date.now()}`, title: '', description: '' }];
                  update({ sections: secs });
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 pl-2"
              >
                <Plus size={11} /> Add Row
              </button>
            </div>
          ))}
          <AddButton label="Add Section" onClick={() => update({ sections: [...sections, { title: '', rows: [] }] })} />
        </div>
      </FieldRow>
    </div>
  );
}

function FormProps({ data, update }) {
  const fields = data.fields || [];
  return (
    <div className="space-y-4">
      <FieldRow label="Label"><TextInput value={data.label} onChange={(v) => update({ label: v })} /></FieldRow>
      <FieldRow label="Form Fields">
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={f.id} className="rounded-lg p-3 space-y-2" style={{ background: 'hsl(var(--muted) / 0.3)', border: '1px solid hsl(var(--border))' }}>
              <div className="flex gap-2">
                <TextInput value={f.label} onChange={(v) => {
                  const fs = [...fields]; fs[i] = { ...f, label: v }; update({ fields: fs });
                }} placeholder="Field label" />
                <RemoveButton onClick={() => update({ fields: fields.filter((_, idx) => idx !== i) })} />
              </div>
              <div className="flex gap-2 items-center">
                <SelectInput value={f.type} onChange={(v) => {
                  const fs = [...fields]; fs[i] = { ...f, type: v }; update({ fields: fs });
                }} options={[
                  { value: 'text', label: 'Text' },
                  { value: 'number', label: 'Number' },
                  { value: 'email', label: 'Email' },
                  { value: 'phone', label: 'Phone' },
                  { value: 'dropdown', label: 'Dropdown' },
                ]} />
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                  <input type="checkbox" checked={f.required || false} onChange={(e) => {
                    const fs = [...fields]; fs[i] = { ...f, required: e.target.checked }; update({ fields: fs });
                  }} className="rounded" />
                  Required
                </label>
              </div>
            </div>
          ))}
          <AddButton label="Add Field" onClick={() => update({ fields: [...fields, { id: `field_${Date.now()}`, label: '', type: 'text', required: false }] })} />
        </div>
      </FieldRow>
    </div>
  );
}

function ConditionProps({ data, update }) {
  return (
    <div className="space-y-4">
      <FieldRow label="Label"><TextInput value={data.label} onChange={(v) => update({ label: v })} /></FieldRow>
      <FieldRow label="Variable"><TextInput value={data.variable} onChange={(v) => update({ variable: v })} placeholder="e.g. user_response" /></FieldRow>
      <FieldRow label="Operator">
        <SelectInput value={data.operator} onChange={(v) => update({ operator: v })} options={[
          { value: 'equals', label: 'Equals (==)' },
          { value: 'not_equals', label: 'Not Equals (!=)' },
          { value: 'contains', label: 'Contains' },
          { value: 'greater_than', label: 'Greater Than' },
          { value: 'less_than', label: 'Less Than' },
        ]} />
      </FieldRow>
      <FieldRow label="Value"><TextInput value={data.value} onChange={(v) => update({ value: v })} placeholder="Comparison value" /></FieldRow>
      <div className="rounded-lg p-3 text-xs text-muted-foreground space-y-1" style={{ background: 'hsl(var(--muted) / 0.3)', border: '1px solid hsl(var(--border))' }}>
        <div className="font-semibold text-foreground mb-2">Branch Handles</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> True branch — bottom left handle</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> False branch — bottom right handle</div>
      </div>
    </div>
  );
}

function ApiRequestProps({ data, update }) {
  const headers = data.headers || [];
  const responseMapping = data.responseMapping || [];
  return (
    <div className="space-y-4">
      <FieldRow label="Label"><TextInput value={data.label} onChange={(v) => update({ label: v })} /></FieldRow>
      <FieldRow label="Method">
        <SelectInput value={data.method} onChange={(v) => update({ method: v })} options={[
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'PATCH', label: 'PATCH' },
          { value: 'DELETE', label: 'DELETE' },
        ]} />
      </FieldRow>
      <FieldRow label="URL"><TextInput value={data.url} onChange={(v) => update({ url: v })} placeholder="https://api.example.com/endpoint" /></FieldRow>
      <FieldRow label="Headers">
        <div className="space-y-1.5">
          {headers.map((h, i) => (
            <div key={i} className="flex gap-1.5">
              <TextInput value={h.key} onChange={(v) => { const hs = [...headers]; hs[i] = { ...h, key: v }; update({ headers: hs }); }} placeholder="Key" />
              <TextInput value={h.value} onChange={(v) => { const hs = [...headers]; hs[i] = { ...h, value: v }; update({ headers: hs }); }} placeholder="Value" />
              <RemoveButton onClick={() => update({ headers: headers.filter((_, idx) => idx !== i) })} />
            </div>
          ))}
          <AddButton label="Add Header" onClick={() => update({ headers: [...headers, { key: '', value: '' }] })} />
        </div>
      </FieldRow>
      <FieldRow label="Request Body"><TextInput value={data.body} onChange={(v) => update({ body: v })} placeholder='{"key": "value"}' multiline /></FieldRow>
      <FieldRow label="Response Mapping">
        <div className="space-y-1.5">
          {responseMapping.map((m, i) => (
            <div key={i} className="flex gap-1.5">
              <TextInput value={m.jsonPath} onChange={(v) => { const rm = [...responseMapping]; rm[i] = { ...m, jsonPath: v }; update({ responseMapping: rm }); }} placeholder="$.data.id" />
              <TextInput value={m.variableName} onChange={(v) => { const rm = [...responseMapping]; rm[i] = { ...m, variableName: v }; update({ responseMapping: rm }); }} placeholder="var_name" />
              <RemoveButton onClick={() => update({ responseMapping: responseMapping.filter((_, idx) => idx !== i) })} />
            </div>
          ))}
          <AddButton label="Add Mapping" onClick={() => update({ responseMapping: [...responseMapping, { jsonPath: '', variableName: '' }] })} />
        </div>
      </FieldRow>
    </div>
  );
}

function SimpleInputProps({ data, update, promptLabel = 'Prompt', showVariableName = true }) {
  return (
    <div className="space-y-4">
      <FieldRow label="Label"><TextInput value={data.label} onChange={(v) => update({ label: v })} /></FieldRow>
      <FieldRow label={promptLabel}><TextInput value={data.prompt || data.question || ''} onChange={(v) => update({ prompt: v, question: v })} placeholder="Enter prompt text..." multiline /></FieldRow>
      {showVariableName && (
        <FieldRow label="Save Response to Variable">
          <TextInput value={data.variableName} onChange={(v) => update({ variableName: v })} placeholder="variable_name" />
        </FieldRow>
      )}
      {'inputType' in data && (
        <FieldRow label="Input Type">
          <SelectInput value={data.inputType} onChange={(v) => update({ inputType: v })} options={[
            { value: 'text', label: 'Text' },
            { value: 'number', label: 'Number' },
            { value: 'email', label: 'Email' },
          ]} />
        </FieldRow>
      )}
    </div>
  );
}

function ConnectFlowProps({ data, update }) {
  return (
    <div className="space-y-4">
      <FieldRow label="Label"><TextInput value={data.label} onChange={(v) => update({ label: v })} /></FieldRow>
      <FieldRow label="Flow ID"><TextInput value={data.flowId} onChange={(v) => update({ flowId: v })} placeholder="flow_123" /></FieldRow>
      <FieldRow label="Flow Name"><TextInput value={data.flowName} onChange={(v) => update({ flowName: v })} placeholder="My Other Flow" /></FieldRow>
    </div>
  );
}

function EndNodeProps({ data, update }) {
  return (
    <div className="space-y-4">
      <FieldRow label="Label"><TextInput value={data.label} onChange={(v) => update({ label: v })} /></FieldRow>
      <FieldRow label="Closing Message (optional)">
        <TextInput value={data.message} onChange={(v) => update({ message: v })} placeholder="Thank you. Goodbye." multiline />
      </FieldRow>
    </div>
  );
}

function StartNodeProps({ data, update }) {
  return (
    <div className="space-y-4">
      <FieldRow label="Label"><TextInput value={data.label} onChange={(v) => update({ label: v })} placeholder="Start" /></FieldRow>
      <div className="text-xs text-muted-foreground rounded-lg p-3" style={{ background: 'hsl(var(--muted) / 0.3)' }}>
        The Start node is the entry point of your flow. Connect it to the first message node.
      </div>
    </div>
  );
}

export function PropertiesPanel() {
  const { nodes, selectedNodeId, selectNode, updateNodeData } = useFlowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const config = getNodeConfig(selectedNode.type || '');
  const Icon = config?.icon;

  const update = (d) => updateNodeData(selectedNode.id, d);

  function renderProps() {
    const { type, data } = selectedNode;
    switch (type) {
      case 'startNode': return <StartNodeProps data={data} update={update} />;
      case 'textMessage': return <TextMessageProps data={data} update={update} />;
      case 'mediaMessage': return <MediaMessageProps data={data} update={update} />;
      case 'quickReply': return <QuickReplyProps data={data} update={update} />;
      case 'listMessage': return <ListMessageProps data={data} update={update} />;
      case 'whatsappForm': return <FormProps data={data} update={update} />;
      case 'conditionNode': return <ConditionProps data={data} update={update} />;
      case 'userInput': return <SimpleInputProps data={data} update={update} promptLabel="Prompt" />;
      case 'askQuestion': return <SimpleInputProps data={data} update={update} promptLabel="Question" />;
      case 'askLocation': return <SimpleInputProps data={data} update={update} promptLabel="Request Message" />;
      case 'askAddress': return <SimpleInputProps data={data} update={update} promptLabel="Request Message" />;
      case 'apiRequest': return <ApiRequestProps data={data} update={update} />;
      case 'connectFlow': return <ConnectFlowProps data={data} update={update} />;
      case 'endNode': return <EndNodeProps data={data} update={update} />;
      default: return <div className="text-xs text-muted-foreground">No properties available</div>;
    }
  }

  return (
    <div className="flex flex-col h-full panel-slide-in" style={{ background: 'hsl(var(--sidebar))' }}>
      <div className="px-4 pt-4 pb-3 flex items-center gap-2" style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
        {Icon && config && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: config.color + '22' }}>
            <Icon size={14} style={{ color: config.color }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{config?.label || selectedNode.type}</div>
          <div className="text-[10px] text-muted-foreground truncate">{selectedNode.id}</div>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderProps()}
      </div>

      <div className="px-4 py-3" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}>
        <button
          onClick={() => useFlowStore.getState().deleteNode(selectedNode.id)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-colors hover:bg-red-500/15"
          style={{ color: 'hsl(var(--destructive))', border: '1px solid hsl(var(--destructive) / 0.3)' }}
        >
          <Trash2 size={13} />
          Delete Node
        </button>
      </div>
    </div>
  );
}
