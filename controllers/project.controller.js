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
      { title: '1.4.3 Kontrast (minimum)', content: 'Text måste ha minst 4.5:1 kontrast mot bakgrund (3:1 för stor text) - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/anvand-tillracklig-kontrast-mellan-text-och-bakgrund' },
      { title: '1.4.11 Kontrast för icke-text', content: 'Grafiska element och UI-komponenter måste ha minst 3:1 kontrast - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/anvand-tillrackliga-kontraster-i-komponenter-och-grafik ' }
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