
import React, { useState } from 'react';
import { FinancialState, EventReport, UserRole } from '../types';
import { jsPDF } from 'jspdf';
import { INSTITUTION_NAME, SCHOOL_NAME } from '../constants';

interface EventsPageProps {
  state: FinancialState;
  onAddEvent: () => void;
  onEditEvent: (event: EventReport) => void;
  onDeleteEvent: (id: string) => void;
}

const EventsPage: React.FC<EventsPageProps> = ({ state, onAddEvent, onEditEvent, onDeleteEvent }) => {
  const [exportingId, setExportingId] = useState<string | null>(null);

  const filteredEvents = state.currentUser?.societyId 
    ? state.events.filter(e => e.societyId === state.currentUser?.societyId)
    : state.events;

  const canAction = (societyId: string) => {
    return state.currentUser?.role === UserRole.ADMIN || state.currentUser?.societyId === societyId;
  };

  const exportToPDF = async (event: EventReport) => {
    setExportingId(event.id);
    const soc = state.societies.find(s => s.id === event.societyId);
    
    try {
      const doc = new jsPDF();
      const margin = 20;
      const headerMargin = 10; 
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const centerX = pageWidth / 2;
      
      // --- HEADER ---
      const headerHeight = 35; 
      doc.setFillColor(241, 245, 249); 
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      
      doc.setTextColor(15, 23, 42); 
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(INSTITUTION_NAME.toUpperCase(), headerMargin, (headerHeight / 2) - 1);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105); 
      doc.text(SCHOOL_NAME.toUpperCase(), headerMargin, (headerHeight / 2) + 4);

      let currentLogoX = pageWidth - headerMargin;

      // Logos
      if (state.institutionLogo) {
        try {
          const instProps = doc.getImageProperties(state.institutionLogo);
          const pxToMm = 25.4 / 96; 
          const scaleFactor = 0.5; 
          let instWidth = (instProps.width * pxToMm) * scaleFactor;
          let instHeight = (instProps.height * pxToMm) * scaleFactor;
          const maxH = 25;
          if (instHeight > maxH) {
            const ratio = maxH / instHeight;
            instHeight = maxH;
            instWidth = instWidth * ratio;
          }
          const instX = pageWidth - headerMargin - instWidth;
          const instY = (headerHeight - instHeight) / 2; 
          doc.addImage(state.institutionLogo, 'PNG', instX, instY, instWidth, instHeight);
          currentLogoX = instX - 8;
        } catch (e) { console.error("Institution logo fail", e); }
      }

      if (soc?.logo) {
        try {
          const socProps = doc.getImageProperties(soc.logo);
          const socMaxHeight = 22;
          const socRatio = socProps.width / socProps.height;
          const socWidth = socMaxHeight * socRatio;
          const socX = currentLogoX - socWidth;
          const socY = (headerHeight - socMaxHeight) / 2;
          doc.addImage(soc.logo, 'PNG', socX, socY, socWidth, socMaxHeight);
        } catch (e) { console.error("Society logo fail", e); }
      }

      // --- TITLE ---
      let currentY = headerHeight + 15;
      doc.setTextColor(15, 23, 42); 
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text("EVENT REPORT", centerX, currentY, { align: 'center' });
      currentY += 10;

      doc.setTextColor(71, 85, 105); 
      doc.setFontSize(11);
      doc.setFont('helvetica', 'medium');
      const organizingSocText = `Organized by: ${soc?.name || 'IEEE Student Branch'} (${soc?.shortName || 'SB'})`;
      doc.text(organizingSocText, centerX, currentY, { align: 'center' });
      currentY += 15;

      // Helper function to draw table
      const drawTable = (title: string, headers: string[], rows: string[][], colWidths: number[]) => {
          if (currentY + 20 > pageHeight) { doc.addPage(); currentY = 20; }
          
          const tableWidth = pageWidth - (2 * margin);
          const rowHeight = 8;
          
          // Table Title
          if (title) {
            doc.setFillColor(241, 245, 249);
            doc.setDrawColor(203, 213, 225);
            doc.rect(margin, currentY, tableWidth, rowHeight, 'FD');
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin + 3, currentY + 5.5);
            currentY += rowHeight;
          }

          // Headers (only if provided, sometimes we just have rows like General Info)
          if (headers.length > 0) {
             let x = margin;
             doc.setFont('helvetica', 'bold');
             doc.setFontSize(9);
             headers.forEach((h, i) => {
                 doc.rect(x, currentY, colWidths[i], rowHeight);
                 doc.text(h, x + 2, currentY + 5.5);
                 x += colWidths[i];
             });
             currentY += rowHeight;
          }

          // Rows
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          rows.forEach((row) => {
             // Calculate max height for this row based on text wrapping
             let maxCellHeight = rowHeight;
             const cellTexts: string[][] = [];
             
             row.forEach((cellVal, i) => {
                 if (cellVal && cellVal.startsWith('data:image')) {
                     // It's an image (Signature), reserve more height
                     const imgHeight = 25; 
                     if (imgHeight > maxCellHeight) maxCellHeight = imgHeight;
                     cellTexts.push([]); // No text
                 } else {
                     const lines = doc.splitTextToSize(cellVal, colWidths[i] - 4);
                     cellTexts.push(lines);
                     const h = (lines.length * 4) + 4; // approximate height
                     if (h > maxCellHeight) maxCellHeight = h;
                 }
             });

             // Check page break
             if (currentY + maxCellHeight > pageHeight - 20) {
                 doc.addPage();
                 currentY = 20;
             }

             let x = margin;
             row.forEach((cellVal, i) => {
                 doc.rect(x, currentY, colWidths[i], maxCellHeight);
                 
                 if (cellVal && cellVal.startsWith('data:image')) {
                     try {
                        const props = doc.getImageProperties(cellVal);
                        const ratio = props.width / props.height;
                        const availW = colWidths[i] - 4;
                        const availH = maxCellHeight - 4;
                        
                        let drawW = availW;
                        let drawH = drawW / ratio;
                        
                        if (drawH > availH) {
                            drawH = availH;
                            drawW = drawH * ratio;
                        }
                        
                        const posX = x + (colWidths[i] - drawW) / 2;
                        const posY = currentY + (maxCellHeight - drawH) / 2;
                        
                        doc.addImage(cellVal, 'PNG', posX, posY, drawW, drawH);
                     } catch (e) {
                         console.error("Signature render error", e);
                     }
                 } else {
                     doc.text(cellTexts[i], x + 2, currentY + 5);
                 }
                 x += colWidths[i];
             });
             currentY += maxCellHeight;
          });
          currentY += 5; // spacing
      };

      // TABLE 1: GENERAL INFORMATION
      const t1Col1 = 60;
      const t1Col2 = pageWidth - (2 * margin) - t1Col1;
      const t1Rows = [
        ["Type of Activity", event.type],
        ["Title of the Activity", event.title],
        ["Date/s", new Date(event.date).toLocaleDateString()],
        ["Time", event.time || '-'],
        ["Venue", event.venue || '-'],
        ["Collaboration/Sponsor", event.collaboration || '-']
      ];
      drawTable("General Information", [], t1Rows, [t1Col1, t1Col2]);

      // TABLE 2: SPEAKER / GUEST DETAILS
      const spkRows: string[][] = [];
      if (event.speakers && event.speakers.length > 0) {
          event.speakers.forEach((s, i) => {
              if (event.speakers && event.speakers.length > 1) {
                  spkRows.push([`SPEAKER ${i + 1}`, ""]); 
              }
              spkRows.push(["Name", s.name]);
              spkRows.push(["Title/Position", s.designation]);
              spkRows.push(["Organization", s.organization]);
              spkRows.push(["Title of Presentation", s.presentationTitle]);
          });
      } else {
          spkRows.push(["Name", "-"]);
          spkRows.push(["Title/Position", "-"]);
          spkRows.push(["Organization", "-"]);
          spkRows.push(["Title of Presentation", "-"]);
      }
      
      drawTable("Speaker/Guest/Presenter Details", [], spkRows, [t1Col1, t1Col2]);

      // TABLE 3: PARTICIPANTS PROFILE
      const partTableWidth = pageWidth - (2 * margin);
      const partColW = partTableWidth / 2;
      drawTable("Participants Profile", ["Type of Participants", "No. of Participants"], [[event.participantType || '-', event.participants.toString()]], [partColW, partColW]);

      // TABLE 4: SYNOPSIS
      const synRows = [
          ["Highlights of the Activity", event.highlights || '-'],
          ["Key Takeaways", event.takeaways || '-'],
          ["Summary of the Activity", event.description || '-'],
          ["Follow-up Plan", event.followUpPlan || '-']
      ];
      drawTable("Synopsis of the Activity", [], synRows, [t1Col1, t1Col2]);

      // TABLE 5: REPORT PREPARED BY
      const repRows = [
          ["Name of the Organiser", event.organizerName || '-'],
          ["Designation/Title", event.organizerDesignation || '-'],
          ["Signature", soc?.advisorSignature || ""] 
      ];
      drawTable("Report Prepared By", [], repRows, [t1Col1, t1Col2]);

      // ANNEXURE: SPEAKER PROFILES (Text)
      if (event.speakers && event.speakers.some(s => s.profileText)) {
          // Always start Annexure on a new page
          doc.addPage();
          currentY = 20;
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.text("ANNEXURE", centerX, currentY, { align: 'center' });
          currentY += 8;

          doc.setFontSize(12);
          doc.text("Speaker Profiles", margin, currentY); // Left Justified
          currentY += 15;

          let index = 1;
          event.speakers.forEach(s => {
              if (s.profileText) {
                  if (currentY + 30 > pageHeight) { doc.addPage(); currentY = 20; }
                  
                  doc.setFont('helvetica', 'bold');
                  doc.setFontSize(11);
                  doc.text(`${index}. ${s.name}`, margin, currentY);
                  currentY += 6;
                  
                  doc.setFont('helvetica', 'normal');
                  doc.setFontSize(10);
                  const lines = doc.splitTextToSize(s.profileText, pageWidth - (2 * margin));
                  doc.text(lines, margin, currentY);
                  currentY += (lines.length * 5) + 8;
                  index++;
              }
          });
      }

      // IMAGES (Multiple) - Auto-fitted
      if (event.images && event.images.length > 0) {
        if (currentY + 90 > pageHeight - 20) { doc.addPage(); currentY = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12); // Matched to Speaker Profiles
        doc.text("Event Photographs", margin, currentY);
        currentY += 10;
        
        event.images.forEach((img) => {
           try {
              const imgProps = doc.getImageProperties(img);
              const availableWidth = pageWidth - (2 * margin);
              const maxPageHeight = pageHeight - (2 * margin);
              
              // Calculate width and height to fit page width while maintaining aspect ratio
              let imgWidth = availableWidth;
              let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
              
              // If calculated height is larger than a full page, scale down to fit height
              if (imgHeight > maxPageHeight) {
                  imgHeight = maxPageHeight;
                  imgWidth = (imgProps.width * imgHeight) / imgProps.height;
              }

              // Check if space remains on current page, else add new page
              if (currentY + imgHeight > pageHeight - margin) {
                 doc.addPage();
                 currentY = 20;
              }

              // Center the image horizontally
              const xPos = margin + (availableWidth - imgWidth) / 2;

              doc.addImage(img, 'JPEG', xPos, currentY, imgWidth, imgHeight, undefined, 'FAST');
              currentY += imgHeight + 10;
           } catch (err) { console.error("Image error", err); }
        });
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for(let i=1; i<=totalPages; i++) {
         doc.setPage(i);
         doc.setFontSize(7);
         doc.setTextColor(148, 163, 184);
         doc.text(`Generated on ${new Date().toLocaleString()}`, margin, pageHeight - 10);
         doc.text(`Ref: ${event.id.toUpperCase()} | Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }

      doc.save(`IEEE_Report_${soc?.shortName || 'Activity'}_${event.title.substring(0, 20)}.pdf`);
    } catch (error) {
      console.error("PDF Export Failure", error);
      alert("Error generating report. Please check society assets.");
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Events Reporting</h2>
          <p className="text-slate-500 text-sm">Review activity reports from all technical societies</p>
        </div>
        <button 
          onClick={onAddEvent}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center"
        >
          <i className="fa-solid fa-calendar-plus mr-2"></i>
          New Report
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
            <i className="fa-solid fa-calendar-xmark text-4xl mb-4 block"></i>
            <p className="text-lg font-medium">No event reports filed yet.</p>
            <p className="text-sm">Click "New Report" to document a society activity.</p>
          </div>
        ) : (
          filteredEvents.map(event => {
            const soc = state.societies.find(s => s.id === event.societyId);
            const editable = canAction(event.societyId);
            const isExporting = exportingId === event.id;
            // Use the first image as the cover
            const displayImage = event.images && event.images.length > 0 ? event.images[0] : null;

            return (
              <div key={event.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="w-full md:w-48 lg:w-64 bg-slate-100 relative shrink-0">
                  {displayImage ? (
                    <img 
                      src={displayImage} 
                      alt={event.title} 
                      className="w-full h-48 md:h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-6">
                      <i className="fa-solid fa-image text-4xl mb-2"></i>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center">No Activity Photo</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur px-2.5 py-1 text-blue-600 text-[10px] font-black rounded-lg shadow-sm uppercase tracking-wider">
                      {soc?.shortName || event.societyId}
                    </span>
                  </div>
                  {event.images && event.images.length > 1 && (
                     <div className="absolute bottom-4 right-4">
                        <span className="bg-black/60 backdrop-blur px-2 py-1 text-white text-[10px] font-bold rounded-lg shadow-sm flex items-center">
                           <i className="fa-solid fa-layer-group mr-1.5"></i> +{event.images.length - 1}
                        </span>
                     </div>
                  )}
                </div>

                <div className="flex-1 p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight line-clamp-2">{event.title}</h3>
                    <div className="flex space-x-1 items-center">
                      <button 
                        disabled={isExporting}
                        onClick={() => exportToPDF(event)}
                        className={`p-2 rounded-lg transition-colors ${isExporting ? 'bg-slate-50 text-slate-300' : 'text-red-600 hover:bg-red-50'}`}
                        title="Download PDF Report"
                      >
                        {isExporting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
                      </button>
                      {editable && (
                        <>
                          <button 
                            onClick={() => onEditEvent(event)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button 
                            onClick={() => onDeleteEvent(event.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                    <div className="flex items-center text-xs text-slate-500">
                      <i className="fa-solid fa-calendar mr-2 text-slate-400"></i>
                      <span className="font-semibold">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <i className="fa-solid fa-tag mr-2 text-slate-400"></i>
                      <span className="font-semibold uppercase">{event.type}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <i className="fa-solid fa-users mr-2 text-slate-400"></i>
                      <span className="font-semibold">{event.participants} Attended</span>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Executive Summary</h4>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{event.description}</p>
                    </div>
                    {event.highlights && (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Key Highlights</h4>
                        <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-2">"{event.highlights}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventsPage;
