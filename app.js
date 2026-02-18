// app.js - Marksheet App
import React, { useState, useRef, useEffect } from 'react';
import { Printer, RefreshCw, Upload, Plus, Trash2, Save, FileText, Settings, RotateCcw } from 'lucide-react';

// --- DATA PERSISTENCE HELPERS ---
const loadState = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const MarksheetApp = () => {
  // --- DEFAULT DATA ---
  const defaultSchool = {
    name: "GYANSTHALI ACADEMY",
    addressLine1: "Krishna Nagar Derapur Kanpur Dehat(U.P.)-209301",
    email: "gyansthaliderapur@gmail.com",
    reportTitle: "PROGRESS EVALUATION REPORT",
    logo: "https://via.placeholder.com/100x100?text=Logo"
  };

  const defaultStudent = {
    name: "AYUSH YADAV",
    father: "RAJKUMAR",
    mother: "MADHU YADAV",
    address: "LALPURWADERAPUR",
    roll: "19",
    admission: "128",
    dob: "2018-04-24",
    class: "1st-A",
    session: "2025-26",
    photo: "https://via.placeholder.com/80x100?text=Photo"
  };

  const defaultSubjects = [
    { id: 1, name: "HINDI", mm1: 50, obt1: 49, mm2: 50, obt2: "", mm3: 50, obt3: "" },
    { id: 2, name: "ENGLISH", mm1: 50, obt1: 41, mm2: 50, obt2: "", mm3: 50, obt3: "" },
    { id: 3, name: "MATHS", mm1: 50, obt1: 45, mm2: 50, obt2: "", mm3: 50, obt3: "" },
    { id: 4, name: "E.V.S.", mm1: 50, obt1: 47, mm2: 50, obt2: "", mm3: 50, obt3: "" },
    { id: 5, name: "Art", mm1: 50, obt1: 40, mm2: 50, obt2: "", mm3: 50, obt3: "" },
    { id: 6, name: "Grammar", mm1: 50, obt1: 43, mm2: 50, obt2: "", mm3: 50, obt3: "" },
    { id: 7, name: "Computer", mm1: 50, obt1: 38, mm2: 50, obt2: "", mm3: 50, obt3: "" },
    { id: 8, name: "G.K.", mm1: 50, obt1: 50, mm2: 50, obt2: "", mm3: 50, obt3: "" }
  ];

  const defaultRemarks = {
    remark: "",
    rank: "",
    attendance: ""
  };

  // --- STATE MANAGEMENT WITH PERSISTENCE ---
  const [activeTab, setActiveTab] = useState('editor'); 
  
  // Initialize state from LocalStorage if available, else use defaults
  const [schoolInfo, setSchoolInfo] = useState(() => loadState('schoolInfo', defaultSchool));
  const [student, setStudent] = useState(() => loadState('student', defaultStudent));
  const [subjects, setSubjects] = useState(() => loadState('subjects', defaultSubjects));
  const [remarks, setRemarks] = useState(() => loadState('remarks', defaultRemarks));

  // --- SAVE EFFECTS ---
  useEffect(() => localStorage.setItem('schoolInfo', JSON.stringify(schoolInfo)), [schoolInfo]);
  useEffect(() => localStorage.setItem('student', JSON.stringify(student)), [student]);
  useEffect(() => localStorage.setItem('subjects', JSON.stringify(subjects)), [subjects]);
  useEffect(() => localStorage.setItem('remarks', JSON.stringify(remarks)), [remarks]);

  // --- CALCULATION LOGIC ---
  const calculateTotal = (sub) => {
    const o1 = parseFloat(sub.obt1) || 0;
    const o2 = parseFloat(sub.obt2) || 0;
    const o3 = parseFloat(sub.obt3) || 0;
    return o1 + o2 + o3;
  };

  const calculateMMTotal = (sub) => {
    const m1 = parseFloat(sub.mm1) || 0;
    const m2 = parseFloat(sub.mm2) || 0;
    const m3 = parseFloat(sub.mm3) || 0;
    return m1 + m2 + m3;
  };

  const grandTotals = subjects.reduce((acc, sub) => {
    acc.mm1 += parseFloat(sub.mm1) || 0;
    acc.obt1 += parseFloat(sub.obt1) || 0;
    acc.mm2 += parseFloat(sub.mm2) || 0;
    acc.obt2 += parseFloat(sub.obt2) || 0;
    acc.mm3 += parseFloat(sub.mm3) || 0;
    acc.obt3 += parseFloat(sub.obt3) || 0;
    acc.mmGrand += calculateMMTotal(sub);
    acc.obtGrand += calculateTotal(sub);
    return acc;
  }, { mm1: 0, obt1: 0, mm2: 0, obt2: 0, mm3: 0, obt3: 0, mmGrand: 0, obtGrand: 0 });

  const percentage = grandTotals.mmGrand > 0 
    ? ((grandTotals.obtGrand / grandTotals.mmGrand) * 100).toFixed(1) 
    : 0;

  // --- HANDLERS ---
  const handleStudentChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleRemarkChange = (e) => {
    setRemarks({ ...remarks, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (id, field, value) => {
    setSubjects(subjects.map(sub => 
      sub.id === id ? { ...sub, [field]: value } : sub
    ));
  };

  const addSubject = () => {
    const newId = subjects.length > 0 ? Math.max(...subjects.map(s => s.id)) + 1 : 1;
    setSubjects([...subjects, { id: newId, name: "New Subject", mm1: 50, obt1: "", mm2: 50, obt2: "", mm3: 50, obt3: "" }]);
  };

  const removeSubject = (id) => {
    setSubjects(subjects.filter(sub => sub.id !== id));
  };

  const resetData = () => {
    if(window.confirm("Are you sure? This will reset all data to default.")) {
      setSchoolInfo(defaultSchool);
      setStudent(defaultStudent);
      setSubjects(defaultSubjects);
      setRemarks(defaultRemarks);
      localStorage.clear();
    }
  };

  const handleImageUpload = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Converting to Base64 so it saves in localStorage
        if (type === 'logo') setSchoolInfo({ ...schoolInfo, logo: reader.result });
        if (type === 'photo') setStudent({ ...student, photo: reader.result });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- RENDER HELPERS ---
  const logoInputRef = useRef(null);
  const photoInputRef = useRef(null);

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col md:flex-row pb-20 md:pb-0">
      
      {/* --- EDITOR PANEL (Left/Top) --- */}
      <div className={`w-full md:w-1/3 lg:w-96 bg-white shadow-lg overflow-y-auto z-10 p-4 border-r border-gray-200 print:hidden ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`} style={{height: '100vh'}}>
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-20 py-2 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Details Editor
          </h2>
          <button onClick={resetData} className="text-red-500 p-2 hover:bg-red-50 rounded" title="Reset All Data">
             <RotateCcw size={18} />
          </button>
        </div>

        {/* Student Details Section */}
        <div className="space-y-4 mb-8">
          <h3 className="font-semibold text-gray-700 border-b pb-1">Student Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500">Student Name</label>
              <input type="text" name="name" value={student.name} onChange={handleStudentChange} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-200 outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Class</label>
              <input type="text" name="class" value={student.class} onChange={handleStudentChange} className="w-full p-2 border rounded text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Session</label>
              <input type="text" name="session" value={student.session} onChange={handleStudentChange} className="w-full p-2 border rounded text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Roll No</label>
              <input type="text" name="roll" value={student.roll} onChange={handleStudentChange} className="w-full p-2 border rounded text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Adm No</label>
              <input type="text" name="admission" value={student.admission} onChange={handleStudentChange} className="w-full p-2 border rounded text-sm outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500">Father's Name</label>
              <input type="text" name="father" value={student.father} onChange={handleStudentChange} className="w-full p-2 border rounded text-sm outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500">Mother's Name</label>
              <input type="text" name="mother" value={student.mother} onChange={handleStudentChange} className="w-full p-2 border rounded text-sm outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500">Address</label>
              <input type="text" name="address" value={student.address} onChange={handleStudentChange} className="w-full p-2 border rounded text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500">DOB</label>
              <input type="date" name="dob" value={student.dob} onChange={handleStudentChange} className="w-full p-2 border rounded text-sm outline-none" />
            </div>
          </div>
        </div>

        {/* Images Upload */}
        <div className="space-y-4 mb-8">
           <h3 className="font-semibold text-gray-700 border-b pb-1">Images</h3>
           <div className="flex gap-4">
             <div className="flex-1">
               <button onClick={() => logoInputRef.current.click()} className="w-full py-2 bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-400 rounded text-xs flex flex-col items-center justify-center gap-1 text-gray-600 transition">
                 <Upload size={14} /> School Logo
               </button>
               <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
             </div>
             <div className="flex-1">
               <button onClick={() => photoInputRef.current.click()} className="w-full py-2 bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-400 rounded text-xs flex flex-col items-center justify-center gap-1 text-gray-600 transition">
                 <Upload size={14} /> Student Photo
               </button>
               <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'photo')} />
             </div>
           </div>
        </div>

        {/* Marks Entry */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center border-b pb-1">
            <h3 className="font-semibold text-gray-700">Marks Entry</h3>
            <button onClick={addSubject} className="text-blue-600 hover:text-blue-800 text-xs flex items-center font-bold"><Plus size={12} className="mr-1"/> Add Subject</button>
          </div>
          
          <div className="space-y-4">
            {subjects.map((sub, index) => (
              <div key={sub.id} className="bg-gray-50 p-3 rounded border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <input 
                    type="text" 
                    value={sub.name} 
                    onChange={(e) => handleSubjectChange(sub.id, 'name', e.target.value)}
                    className="font-bold text-gray-700 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none w-2/3"
                  />
                  <button onClick={() => removeSubject(sub.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">Term 1</div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">Term 2</div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">Term 3</div>
                  
                  <div className="flex gap-1">
                    <input type="number" placeholder="MM" value={sub.mm1} onChange={(e) => handleSubjectChange(sub.id, 'mm1', e.target.value)} className="w-1/2 p-1 text-xs border rounded text-center" />
                    <input type="number" placeholder="Obt" value={sub.obt1} onChange={(e) => handleSubjectChange(sub.id, 'obt1', e.target.value)} className="w-1/2 p-1 text-xs border rounded text-center bg-white font-bold" />
                  </div>
                  <div className="flex gap-1">
                    <input type="number" placeholder="MM" value={sub.mm2} onChange={(e) => handleSubjectChange(sub.id, 'mm2', e.target.value)} className="w-1/2 p-1 text-xs border rounded text-center" />
                    <input type="number" placeholder="Obt" value={sub.obt2} onChange={(e) => handleSubjectChange(sub.id, 'obt2', e.target.value)} className="w-1/2 p-1 text-xs border rounded text-center bg-white font-bold" />
                  </div>
                  <div className="flex gap-1">
                    <input type="number" placeholder="MM" value={sub.mm3} onChange={(e) => handleSubjectChange(sub.id, 'mm3', e.target.value)} className="w-1/2 p-1 text-xs border rounded text-center" />
                    <input type="number" placeholder="Obt" value={sub.obt3} onChange={(e) => handleSubjectChange(sub.id, 'obt3', e.target.value)} className="w-1/2 p-1 text-xs border rounded text-center bg-white font-bold" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Remarks Section */}
        <div className="space-y-4 pb-20">
          <h3 className="font-semibold text-gray-700 border-b pb-1">Remarks & Status</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-gray-500">Teacher's Remark</label>
              <input type="text" name="remark" value={remarks.remark} onChange={handleRemarkChange} className="w-full p-2 border rounded text-sm outline-none" placeholder="e.g. Excellent Work" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Rank</label>
                <input type="text" name="rank" value={remarks.rank} onChange={handleRemarkChange} className="w-full p-2 border rounded text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Attendance</label>
                <input type="text" name="attendance" value={remarks.attendance} onChange={handleRemarkChange} className="w-full p-2 border rounded text-sm outline-none" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* --- PREVIEW PANEL (Right/Bottom) --- */}
      <div className={`flex-grow bg-gray-700 p-2 md:p-8 overflow-auto flex justify-center ${activeTab === 'editor' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* THE A4 SHEET */}
        <div id="marksheet-preview" className="bg-white shadow-2xl relative print:shadow-none print:m-0 print:w-full print:h-full origin-top transform md:scale-100 scale-[0.60] sm:scale-[0.8]" 
             style={{ 
               width: '210mm', 
               minHeight: '297mm',
               padding: '5mm',
               boxSizing: 'border-box'
             }}>
          
          <div className="h-full border-2 border-[#ed1c24] p-[3px] flex flex-col">
            <div className="flex-grow border border-black p-[5px] flex flex-col relative">
              
              {/* HEADER */}
              <div className="flex justify-between items-start mb-2 h-[140px]">
                {/* Logo */}
                <div className="w-24 h-24 relative flex-shrink-0">
                  <img src={schoolInfo.logo} alt="School Logo" className="w-full h-full object-contain" />
                </div>

                {/* School Details */}
                <div className="flex-grow text-center pt-2 px-2 overflow-hidden">
                  <h1 className="text-[#ed1c24] text-[28px] font-[800] uppercase tracking-wide leading-tight" style={{textShadow: '0.5px 0px 0px #ed1c24', fontFamily: 'Arial, sans-serif'}}>
                    {schoolInfo.name}
                  </h1>
                  <div className="text-xs font-[600] text-black my-1 whitespace-nowrap font-sans">
                    {schoolInfo.addressLine1} EmailID:-
                  </div>
                  <div className="text-xs font-[600] text-blue-800 underline mb-2 font-sans">
                    {schoolInfo.email}
                  </div>
                  
                  <div className="inline-block bg-[#ffff00] text-[#ed1c24] px-4 py-1 font-bold text-sm border-b-2 border-[#ed1c24] underline mb-2">
                    {schoolInfo.reportTitle}
                  </div>
                  
                  <div className="text-sm font-bold text-blue-900 whitespace-nowrap mt-1 font-sans">
                    ACADEMIC SESSION: <span className="text-black">{student.session}</span>
                  </div>
                  <div className="text-xl font-bold text-purple-900 mt-1 whitespace-nowrap" style={{fontFamily: '"Times New Roman", serif'}}>
                    CLASS: <span className="text-black ml-1">{student.class}</span>
                  </div>
                </div>

                {/* Photo */}
                <div className="w-24 h-28 border border-black p-1 bg-gray-50 flex-shrink-0">
                   <img src={student.photo} alt="Student" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* STUDENT INFO BOX */}
              <div className="bg-[#d1eeee] border-y-2 border-black p-2 mb-2 flex justify-between" style={{height: '100px', fontFamily: '"Times New Roman", serif'}}>
                <div className="flex flex-col justify-evenly text-xs font-bold w-2/3">
                  <div className="flex items-center"><span className="w-32 inline-block">STUDENT'S NAME</span> : <span className="uppercase ml-1">{student.name}</span></div>
                  <div className="flex items-center"><span className="w-32 inline-block">MOTHER'S NAME</span> : <span className="uppercase ml-1">{student.mother}</span></div>
                  <div className="flex items-center"><span className="w-32 inline-block">FATHER'S NAME</span> : <span className="uppercase ml-1">{student.father}</span></div>
                  <div className="flex items-center"><span className="w-32 inline-block">ADDRESS</span> : <span className="uppercase ml-1 truncate">{student.address}</span></div>
                </div>
                <div className="flex flex-col justify-evenly text-xs font-bold text-right w-1/3">
                  <div><span className="mr-2">ROLL NO</span> : <span className="ml-1">{student.roll}</span></div>
                  <div><span className="mr-2">ADMISSION NO</span> : <span className="ml-1">{student.admission}</span></div>
                  <div><span className="mr-2">DOB</span> : <span className="ml-1">{student.dob}</span></div>
                </div>
              </div>

              {/* MARKS TABLE */}
              <div className="flex-grow flex flex-col mb-1">
                <table className="w-full border-collapse font-sans text-xs" style={{tableLayout: 'fixed'}}>
                  <thead>
                    <tr className="bg-[#fce4d6]" style={{height: '35px'}}>
                      <th rowSpan="2" className="border border-black w-[20%] text-left pl-2 font-bold text-[13px]">SUBJECTS</th>
                      <th colSpan="2" className="border border-black text-blue-900 text-xs">FIRST TERM EXAM</th>
                      <th colSpan="2" className="border border-black text-blue-900 text-xs">SECOND TERM EXAM</th>
                      <th colSpan="2" className="border border-black text-blue-900 text-xs">THIRD TERM EXAM</th>
                      <th colSpan="2" className="border border-black text-blue-900 text-xs">GRAND TOTAL</th>
                    </tr>
                    <tr className="bg-[#fce4d6]" style={{height: '30px'}}>
                      <th className="border border-black text-[#0070c0] font-bold w-[8%]">MM</th>
                      <th className="border border-black text-[#0070c0] font-bold w-[12%]">MARKS OBTAINED</th>
                      <th className="border border-black text-[#0070c0] font-bold w-[8%]">MM</th>
                      <th className="border border-black text-[#0070c0] font-bold w-[12%]">MARKS OBTAINED</th>
                      <th className="border border-black text-[#0070c0] font-bold w-[8%]">MM</th>
                      <th className="border border-black text-[#0070c0] font-bold w-[12%]">MARKS OBTAINED</th>
                      <th className="border border-black text-[#0070c0] font-bold w-[8%]">MM</th>
                      <th className="border border-black w-[12%]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub) => (
                      <tr key={sub.id} style={{height: '30px'}}>
                        <td className="border border-black pl-2 font-bold text-left uppercase">{sub.name}</td>
                        <td className="border border-black text-center text-[#0070c0] font-bold">{sub.mm1}</td>
                        <td className="border border-black text-center">{sub.obt1}</td>
                        <td className="border border-black text-center text-[#0070c0] font-bold">{sub.mm2}</td>
                        <td className="border border-black text-center">{sub.obt2}</td>
                        <td className="border border-black text-center text-[#0070c0] font-bold">{sub.mm3}</td>
                        <td className="border border-black text-center">{sub.obt3}</td>
                        <td className="border border-black text-center text-[#0070c0] font-bold">{calculateMMTotal(sub)}</td>
                        <td className="border border-black text-center font-bold">{calculateTotal(sub) || ""}</td>
                      </tr>
                    ))}
                    
                    {/* Padding Rows to keep table looking full if subjects are few */}
                    {[...Array(Math.max(0, 10 - subjects.length))].map((_, i) => (
                       <tr key={`pad-${i}`} style={{height: '30px'}}>
                         <td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td>
                       </tr>
                    ))}

                    {/* Totals Row */}
                    <tr className="bg-[#f2f2f2] font-bold" style={{height: '35px'}}>
                      <td className="border border-black pl-2 text-left">TOTAL</td>
                      <td className="border border-black text-center text-[#0070c0]">{grandTotals.mm1}</td>
                      <td className="border border-black text-center">{grandTotals.obt1}</td>
                      <td className="border border-black text-center text-[#0070c0]">{grandTotals.mm2}</td>
                      <td className="border border-black text-center">{grandTotals.obt2}</td>
                      <td className="border border-black text-center text-[#0070c0]">{grandTotals.mm3}</td>
                      <td className="border border-black text-center">{grandTotals.obt3}</td>
                      <td className="border border-black text-center text-[#0070c0]">{grandTotals.mmGrand}</td>
                      <td className="border border-black text-center">{grandTotals.obtGrand}</td>
                    </tr>

                    {/* Percentage Row */}
                    <tr className="bg-[#f2f2f2] font-bold" style={{height: '35px'}}>
                      <td className="border border-black pl-2 text-left">PERCENTAGE</td>
                      <td colSpan="2" className="border border-black text-center">
                        {grandTotals.mm1 > 0 ? ((grandTotals.obt1/grandTotals.mm1)*100).toFixed(0) + '%' : ''}
                      </td>
                      <td colSpan="2" className="border border-black text-center">
                        {grandTotals.mm2 > 0 ? ((grandTotals.obt2/grandTotals.mm2)*100).toFixed(0) + '%' : ''}
                      </td>
                      <td colSpan="2" className="border border-black text-center">
                        {grandTotals.mm3 > 0 ? ((grandTotals.obt3/grandTotals.mm3)*100).toFixed(0) + '%' : ''}
                      </td>
                      <td colSpan="2" className="border border-black text-center text-lg">{percentage}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* CO-SCHOLASTIC & GRADES */}
              <div className="bg-[#fce4d6] font-bold text-[11px] p-1 border border-black flex justify-between items-center mb-2 font-sans">
                <span>Co-Scholastic Area</span>
                <span className="text-right">A+:OUTSTANDING, A:EXCELLENT, B+:VERY GOOD, B:GOOD, C:AVERAGE</span>
              </div>

              {/* GRADING SCALE */}
              <div className="flex border border-black mb-4 h-[35px] text-[10px] font-sans">
                <div className="bg-[#595959] text-white font-bold w-1/5 flex items-center justify-center text-center">MARK RANGE: GRADE</div>
                <div className="w-4/5 flex">
                    <div className="flex-1 bg-[#dbe5f1] border-r border-white flex items-center justify-center">91-100:A1</div>
                    <div className="flex-1 bg-[#dbe5f1] border-r border-white flex items-center justify-center">81-90:A2</div>
                    <div className="flex-1 bg-[#dbe5f1] border-r border-white flex items-center justify-center">71-80:B1</div>
                    <div className="flex-1 bg-[#dbe5f1] border-r border-white flex items-center justify-center">61-70:B2</div>
                    <div className="flex-1 bg-[#dbe5f1] border-r border-white flex items-center justify-center">51-60:C1</div>
                    <div className="flex-1 bg-[#dbe5f1] border-r border-white flex items-center justify-center">41-50:C2</div>
                    <div className="flex-1 bg-[#dbe5f1] border-r border-white flex items-center justify-center">33-40:D</div>
                    <div className="flex-1 bg-[#dbe5f1] border-r border-white flex items-center justify-center">21-32:E1</div>
                    <div className="flex-1 bg-[#dbe5f1] flex items-center justify-center">00-20:E2</div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-auto">
                <div className="flex justify-between items-end text-sm font-bold font-sans px-2 mb-10">
                  <div className="flex items-end w-1/3">
                     Remark: <div className="border-b border-black flex-grow ml-2 relative top-[2px]">{remarks.remark}</div>
                  </div>
                  <div className="flex items-end w-1/4 justify-center">
                     Rank: <div className="border-b border-black w-16 text-center mx-2 relative top-[2px]">{remarks.rank}</div>
                  </div>
                  <div className="flex items-end w-1/3">
                     Attendance: <div className="border-b border-black flex-grow ml-2 relative top-[2px]">{remarks.attendance}</div>
                  </div>
                </div>

                <div className="flex justify-between text-sm font-bold font-sans px-8 mb-4">
                  <div className="text-center">
                    <div className="border-t-2 border-dotted border-black w-40 mb-1"></div>Date
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-dotted border-black w-40 mb-1"></div>ClassTeacher
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-dotted border-black w-40 mb-1"></div>Principal
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE NAVIGATION --- */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t md:hidden flex justify-around p-3 z-50 print:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <button onClick={() => setActiveTab('editor')} className={`flex flex-col items-center text-xs ${activeTab === 'editor' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
          <Settings size={20} /> Edit Data
        </button>
        <button onClick={() => setActiveTab('preview')} className={`flex flex-col items-center text-xs ${activeTab === 'preview' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
          <FileText size={20} /> View Sheet
        </button>
      </div>

      {/* --- PRINT FLOATING ACTION BUTTON --- */}
      <button 
        onClick={handlePrint}
        className="fixed bottom-20 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition transform hover:scale-105 z-50 flex items-center gap-2 print:hidden"
        title="Print or Save as PDF"
      >
        <Printer size={24} /> 
        <span className="hidden md:inline font-bold">Print Marksheet</span>
      </button>

      {/* --- GLOBAL STYLES FOR PRINTING --- */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #marksheet-preview, #marksheet-preview * {
            visibility: visible;
          }
          #marksheet-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0 !important;
            box-shadow: none !important;
            transform: scale(1) !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MarksheetApp />);

