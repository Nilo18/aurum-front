import { Component, ElementRef, Injectable, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Field, Row, sections } from './workspace.data';
@Injectable({providedIn:'root'})
export class StaffPreviewStore {
  data = signal<Record<string,Row[]>>(Object.fromEntries(Object.entries(sections).map(([key,value])=>[key,value.rows.map(row=>({...row}))])));
  save(key:string, row:Row, original?:Row) {
    this.data.update(data=>({...data,[key]:original ? data[key].map(item=>item===original ? row : item) : [...data[key],row]}));
  }
}
@Component({selector:'app-staff-workspace',imports:[FormsModule,RouterLink,DecimalPipe],templateUrl:'./workspace.html',styleUrl:'./workspace.scss'})
export class StaffWorkspace {
  section = input('dashboard');
  store = inject(StaffPreviewStore);
  search = signal('');
  filter = signal('');
  editor = signal(false);
  dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  constructor() {
    effect(() => { this.dialog()?.nativeElement.showModal(); });
  }
  editing?: Row;
  draft: Row = {};
  notice = signal('');
  key = computed(()=>this.section()==='event-requests' || this.section()==='dashboard' ? 'events' : this.section());
  config = computed(()=>sections[this.key()]);
  rows = computed(()=>this.store.data()[this.key()].filter(row=>this.section()!=='event-requests'||row['status']==='REQUESTED'));
  filtered = computed(()=>this.rows().filter(row=>(!this.filter()||String(row[this.config().filter])===this.filter()) && Object.entries(row).some(([key,value])=>this.display(key,value).toLowerCase().includes(this.search().toLowerCase()))));
  filters = computed(()=>Array.from(new Set(this.rows().map(row=>String(row[this.config().filter])))));
  columns = computed(()=>this.config().fields.filter(field=>field.type!=='textarea'));
  events = computed(()=>this.store.data()['events']);
  upcoming = computed(()=>this.events().filter(row=>['CONFIRMED','PLANNING'].includes(String(row['status']))).sort((a,b)=>String(a['date']).localeCompare(String(b['date']))));
  requested = computed(()=>this.events().filter(row=>row['status']==='REQUESTED').length);
  total = computed(()=>this.events().filter(row=>!['REJECTED','CANCELLED'].includes(String(row['status']))).reduce((sum,row)=>sum+Number(row['totalCost']),0));
  title = computed(()=>this.section()==='event-requests'?'Event requests':this.config().title);
  human(value:unknown) { const text=String(value??''); return text.includes('_')||text===text.toUpperCase() ? text.toLowerCase().replace(/_/g,' ').replace(/^./,c=>c.toUpperCase()) : text; }
  display(key:string,value:unknown):string {
    if(key==='clientId') return String(this.store.data()['clients'].find(row=>row['id']===Number(value))?.['name']??`Client #${value}`);
    if(key==='supplierId') return String(this.store.data()['suppliers'].find(row=>row['id']===Number(value))?.['partnerNumber']??`Supplier #${value}`);
    if(['price','salary','totalCost','pricePerPerson'].includes(key)) return '₾ '+Number(value).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    if(key==='rating') return '★'.repeat(Number(value))+' · '+value+'/5';
    return this.human(value);
  }
  related(field:Field) { return this.store.data()[field.type==='client'?'clients':field.type==='supplier'?'suppliers':'events']; }
  relatedLabel(field:Field,row:Row) { return String(field.type==='client'?row['name']:field.type==='supplier'?row['partnerNumber']:`#${row['id']} · ${this.human(row['eventType'])}`); }
  open(row?:Row) {
    this.editing=row;
    this.draft=row?{...row}:Object.fromEntries(this.config().fields.map(field=>[field.key,field.options?.[0]??'']));
    if(!row && this.key()==='events') this.draft['status']='REQUESTED';
    this.editor.set(true);
  }
  close() { this.editor.set(false); }
  save() {
    const row={...this.draft};
    for(const field of this.config().fields) if(['number','client','supplier','event'].includes(field.type??'')||field.key==='rating') row[field.key]=Number(row[field.key]);
    row['id']=this.editing?.['id']??Math.max(0,...this.store.data()[this.key()].map(item=>Number(item['id'])))+1;
    this.store.save(this.key(),row,this.editing);
    this.close(); this.notice.set(`${this.human(this.config().singular)} saved in this preview session.`);
  }
}
