"use strict";

/* Controllers för projekt */

const { Project, projectValidationSchema } = require('../models/project.model');
const { Checklist } = require('../models/checklist.model');
const Progress = require('../models/progress.model');

// Funktion för att skapa default-checklistor
async function createDefaultChecklists(projectId) {
  const defaultChecklists = {
    designer: [
      { title: '1.4.1 Användning av färg', content: 'Använd inte enbart färg för att förmedla information, indikera handling eller särskilja element - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/anvand-inte-enbart-farg-for-att-formedla-information' },
      { title: '1.4.3 Färgkontrast', content: 'Text måste ha minst 4.5:1 kontrast mot bakgrund (3:1 för stor text) - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/anvand-tillracklig-kontrast-mellan-text-och-bakgrund' },
      { title: '1.4.11 Färgkontrast för icke-text', content: 'Grafiska element och UI-komponenter måste ha minst 3:1 kontrast - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/anvand-tillrackliga-kontraster-i-komponenter-och-grafik ' },
      { title: '2.4.6 Rubriker och etiketter', content: 'Rubriker och etiketter ska tydligt beskriva ämne eller syfte - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/skriv-beskrivande-rubriker-och-ledtexter' },
      { title: '2.4.7 Fokusindikator', content: 'Designa tydliga visuella indikatorer för tangentbordsfokus - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/gor-det-synligt-vad-som-ar-i-fokus' },
      { title: '1.3.2 Meningsfull ordning', content: 'Ordna innehåll så läsordningen är logisk även utan visuell styling -  Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/ha-en-meningsfull-fokusordning' },
      { title: '1.3.3 Sensoriska egenskaper', content: 'Instruktioner får inte endast förlita sig på form, storlek, position eller ljud - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/gor-inte-instruktioner-beroende-av-sensoriska-kannetecken' },
      { title: '1.4.4 Ändra textstorlek', content: 'Säkerställ att layout fungerar när text förstoras upp till 200% - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/se-till-att-text-gar-att-forstora' },
      { title: '1.4.10 Responsivitet', content: 'Design ska fungera utan horisontell scrollning vid 320px bredd - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/skapa-en-flexibel-layout-som-fungerar-vid-forstoring-eller-pa-liten-skarm' },
      { title: '1.4.12 Textavstånd', content: 'Design ska fungera när användare ökar radavstånd, teckenavstånd etc. - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/se-till-att-det-gar-att-oka-avstand-mellan-tecken-rader-stycken-och-ord' },
      { title: '1.4.5 Bilder av text', content: 'Undvik text i bilder när ren text kan användas - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/anvand-text-inte-bilder-av-text-for-att-visa-text' },
      { title: '3.2.3 Konsekvent navigering', content: 'Navigeringsmenyer ska se likadana ut och fungera konsekvent - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/var-konsekvent-i-navigation'},
      { title: '3.2.4 Konsekvent benämning', content: 'Komponenter med samma funktion ska identifieras konsekvent - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/konsekvent-benamning' },
      { title: '2.3.1 Blinkande innehåll', content: 'Undvik innehåll som blinkar mer än tre gånger per sekund - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/orsaka-inte-epileptiska-anfall-genom-blinkande' },
      { title: '2.5.8 Klickyta', content: 'Klickbara områden bör vara minst 24x24 CSS-pixlar (rekommendation, blir krav när EN-standarden uppdateras) - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/gor-lankar-klickbara-ytor-och-menyer-anvandbara-for-alla' },
      { title: '3.3.2 Etiketter eller instruktioner', content: 'Designa tydliga etiketter (labels) och instruktioner för formulärfält - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/skapa-tydliga-faltetiketter-ledtexter' },
      { title: '2.4.4 Länkens syfte', content: 'Länktexter ska vara beskrivande och förstås i sitt sammanhang - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/gor-lankar-klickbara-ytor-och-menyer-anvandbara-for-alla' }
    ],
    developer: [
      { title: 'Checklistpunkt 1', content: 'Utvecklare - https://www.digg.se' },
      { title: 'Checklistpunkt 2', content: 'Utvecklare - https://www.digg.se' },
      { title: 'Checklistpunkt 3', content: 'Utvecklare - https://www.digg.se' }
    ],
    tester: [
      { title: 'Checklistpunkt 1', content: 'Testare - https://www.digg.se' },
      { title: 'Checklistpunkt 2', content: 'Testare - https://www.digg.se' },
      { title: 'Checklistpunkt 3', content: 'Testare - https://www.digg.se' }
    ]
  };

  for (const [role, items] of Object.entries(defaultChecklists)) {
    const checklist = new Checklist({
      projectId,
      role,
      items
    });
    await checklist.save();

    // Skapa tracking av projektstatus (progression)
    const progress = new Progress({
      projectId,
      role,
      totalItems: items.length
    });
    await progress.save();
  }
}

// Hämta alla projekt (admin)
exports.getAllProjects = async (request, h) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return h.response(projects).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

// Hämta ett projekt (med id)
exports.getProjectById = async (request, h) => {
  try {
    const project = await Project.findById(request.params.id);
    if (!project) {
      return h.response({ message: "Projekt hittades inte." }).code(404);
    }
    return h.response(project).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

// Skapa nytt projekt (admin)
exports.createProject = async (request, h) => {
 try {
   const { error } = projectValidationSchema.validate(request.payload);
   if (error) {
     return h.response({ message: error.details[0].message }).code(400);
   }

   // Kontrollera om projekt med samma namn redan finns
   const { name } = request.payload;
   const existingProject = await Project.findOne({ 
     name: { $regex: new RegExp(`^${name}$`, 'i') }
   });

 if (existingProject) {
  return h.response({ 
    message: `Ett projekt med namnet ${name} finns redan.`
  }).code(409);
}
   const project = new Project(request.payload);
   const savedProject = await project.save();

   // Skapa default-checklistor för alla roller
   await createDefaultChecklists(savedProject._id);

   return h.response(savedProject).code(201);
 } catch (error) {
   console.error("Fel vid skapande av projekt:", error);
   
   // Hantera MongoDB duplicate key error
   if (error.code === 11000) {
     return h.response({ 
       message: "Ett projekt med detta namn finns redan." 
     }).code(409);
   }
   
   return h.response({ message: "Internt serverfel." }).code(500);
 }
};

// Uppdatera projekt (admin)
exports.updateProject = async (request, h) => {
  try {
    const { error } = projectValidationSchema.validate(request.payload);
    if (error) {
      return h.response({ message: error.details[0].message }).code(400);
    }

    const updatedProject = await Project.findByIdAndUpdate(
      request.params.id,
      request.payload,
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return h.response({ message: "Projektet hittades inte." }).code(404);
    }

    return h.response(updatedProject).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

// Ta bort projekt (admin)
exports.deleteProject = async (request, h) => {
  try {
    const project = await Project.findByIdAndDelete(request.params.id);
    
    if (!project) {
      return h.response({ message: "Projektet hittades inte." }).code(404);
    }

    // Ta bort relaterade checklistor och progression
    await Checklist.deleteMany({ projectId: request.params.id });
    await Progress.deleteMany({ projectId: request.params.id });

    return h.response().code(204);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};