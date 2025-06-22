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
      { title: '1.4.3 Färgkontraster', content: 'Text måste ha minst 4.5:1 kontrast mot bakgrund (3:1 för stor text) - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/anvand-tillracklig-kontrast-mellan-text-och-bakgrund' },
      { title: '1.4.11 Färgkontraster för icke-text', content: 'Grafiska element och UI-komponenter måste ha minst 3:1 kontrast - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/anvand-tillrackliga-kontraster-i-komponenter-och-grafik ' },
      { title: '2.4.6 Rubriker och etiketter', content: 'Rubriker och etiketter ska tydligt beskriva ämne eller syfte - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/skriv-beskrivande-rubriker-och-ledtexter' },
      { title: '2.4.7 Fokusindikatorer', content: 'Designa tydliga visuella indikatorer för tangentbordsfokus - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/gor-det-synligt-vad-som-ar-i-fokus' },
      { title: '1.3.2 Meningsfull ordning', content: 'Ordna innehåll så läsordningen är logisk även utan visuell styling -  Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/ha-en-meningsfull-fokusordning' },
      { title: '1.3.3 Sensoriska egenskaper', content: 'Instruktioner får inte endast förlita sig på form, storlek, position eller ljud - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/gor-inte-instruktioner-beroende-av-sensoriska-kannetecken' },
      { title: '1.4.4 Ändra textstorlek', content: 'Säkerställ att layout fungerar när text förstoras upp till 200% - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/se-till-att-text-gar-att-forstora' },
      { title: '1.4.10 Responsivitet (Reflow)', content: 'Design ska fungera utan horisontell scrollning vid 320px bredd - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/skapa-en-flexibel-layout-som-fungerar-vid-forstoring-eller-pa-liten-skarm' },
      { title: '1.4.12 Textavstånd', content: 'Design ska fungera när användare ökar radavstånd, teckenavstånd etc. - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/se-till-att-det-gar-att-oka-avstand-mellan-tecken-rader-stycken-och-ord' },
      { title: '1.4.5 Bilder av text', content: 'Undvik text i bilder när ren text kan användas - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/anvand-text-inte-bilder-av-text-for-att-visa-text' },
      { title: '3.2.3 Konsekvent navigering', content: 'Navigeringsmenyer ska se likadana ut och fungera konsekvent - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/var-konsekvent-i-navigation'},
      { title: '3.2.4 Konsekvent benämning', content: 'Komponenter med samma funktion ska benämnas konsekvent - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/konsekvent-benamning' },
      { title: '2.3.1 Blinkande innehåll', content: 'Undvik innehåll som blinkar mer än tre gånger per sekund - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/orsaka-inte-epileptiska-anfall-genom-blinkande' },
      { title: '2.5.8 Klickytor', content: 'Klickbara områden bör vara minst 24x24 CSS-pixlar (rekommendation, blir krav när EN-standarden uppdateras) - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/gor-lankar-klickbara-ytor-och-menyer-anvandbara-for-alla' },
      { title: '3.3.2 Etiketter eller instruktioner', content: 'Designa tydliga etiketter (labels) och instruktioner för formulärfält - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/skapa-tydliga-faltetiketter-ledtexter' },
      { title: '2.4.4 Länkars syften', content: 'Länktexter ska vara beskrivande och förstås i sitt sammanhang - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/gor-lankar-klickbara-ytor-och-menyer-anvandbara-for-alla' }
    ],
    developer: [
      { title: '1.1.1 Alt-attribut', content: 'Alla bilder måste ha alt-attribut med relevant beskrivning - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/beskriv-med-text-allt-innehall-som-inte-ar-text' },
      { title: '1.3.1 Semantisk HTML', content: 'Använd semantisk HTML för rubriker, listor, tabeller etc. - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/formedla-information-struktur-och-relationer-i-koden' },
      { title: '2.1.1 Tangentbord', content: 'All funktionalitet ska vara åtkomlig via tangentbord - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/all-funktionalitet-ska-kunna-anvandas-med-tangentbord' },
      { title: '2.1.2 Ingen tangentbordsfälla', content: 'Fokus ska kunna flyttas från alla element med tangentbord - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/ingen-tangentbordsfalla' },
      { title: '2.4.1 Skipplänk', content: 'Implementera "hoppa till huvudinnehåll"-länkar - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/gor-det-mojligt-att-hoppa-forbi-aterkommande-innehall' },
      { title: '2.4.2 Sidtitel', content: 'Varje sida ska ha en unik och beskrivande title-tagg - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/skriv-beskrivande-sidtitlar' },
      { title: '2.4.3 Fokusordning', content: 'Tab-ordningen ska vara logisk och meningsfull - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/ha-en-meningsfull-fokusordning' },
      { title: '4.1.2 Namn, roll, värde', content: 'Använd korrekta ARIA-attribut för anpassade komponenter - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/se-till-att-komponenter-fungerar-i-hjalpmedel' },
      { title: '3.1.1 Sidans språk', content: 'Ange korrekt lang-attribut på HTML-elementet - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/ange-sidans-sprak-i-koden' },
      { title: '3.1.2 Språkförändringar', content: 'Markera text på andra språk med lang-attribut - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/ange-sprakforandringar-i-koden' },
      { title: '1.3.5 Identifiera inmatningssyfte', content: 'Använd autocomplete-attribut för vanliga formulärfält - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/ange-syftet-for-formularfalt-i-koden' },
      { title: '2.2.1 Justerbar timing', content: 'Ge användare möjlighet att förlänga tidsgränser - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/gor-det-mojligt-att-justera-tidsbegransningar' },
      { title: '2.2.2 Pausa, stoppa, dölja', content: 'Automatiskt rörligt innehåll ska kunna pausas/stoppas - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/gor-det-mojligt-att-pausa-eller-stanga-av-rorelser' },
      { title: '2.4.5 Flera sätt att navigera', content: 'Erbjud flera sätt att hitta sidor (t.ex. meny + sök) - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/gor-funktioner-for-tillganglighet-latta-att-hitta' },
      { title: '3.2.1 Förändringar vid fokus', content: 'Inga större förändringar ska ske när element får fokus - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/ingen-kontextforandring-vid-fokus' },
      { title: '3.2.2 Vid inmatning', content: 'Formulär ska inte skickas automatiskt vid ändring - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/utfor-inga-ovantade-forandringar-vid-inmatning' },
      { title: '3.3.1 Felmeddelanden', content: 'Visa tydliga felmeddelanden vid valideringsfel - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/visa-var-ett-fel-uppstatt-och-beskriv-det-tydligt' },
      { title: '3.3.3 Felförslag', content: 'Ge förslag på hur användare kan rätta fel - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/ge-forslag-pa-hur-fel-kan-rattas-till' },
      { title: '3.3.4 Förebyggande av fel', content: 'Låt användare granska/bekräfta viktig information - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/ge-mojlighet-att-angra-korrigera-eller-bekrafta-vid-viktiga-transaktioner' },
      { title: '4.1.3 Statusmeddelanden', content: 'Använd ARIA live regions för dynamiska meddelanden - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/se-till-att-hjalpmedel-kan-presentera-meddelanden-som-inte-ar-i-fokus' },
      { title: '2.1.4 Snabbtangenter', content: 'Kortkommandon ska kunna stängas av eller ändras - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/var-forsiktig-med-kortkommandon' },
      { title: '2.5.1 Pekgester', content: 'Funktioner ska kunna aktiveras med enkla klick/tryck - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/erbjud-alternativ-till-komplexa-finger--eller-pekarrorelser' },
      { title: '2.5.2 Pekavbrytning', content: 'Klickhändelser ska aktiveras på "up"-händelsen - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/gor-det-mojligt-att-angra-klick' },
      { title: '2.5.3 Etikett i namn', content: 'Synlig text ska ingå i tillgängligt namn - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/se-till-att-text-pa-knappar-och-kontroller-overensstammer-med-maskinlasbara-namn' },
      { title: '1.3.4 Orientering', content: 'Tillåt både stående och liggande orientering - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/se-till-att-innehallet-anpassas-efter-skarmens-riktning' },
      { title: '1.2.2 Textning (inspelad)', content: 'Videor ska ha textning för förinspelat innehåll - Digg: https://www.digg.se/webbriktlinjer/alla-webbriktlinjer/texta-ljudet-i-inspelade-filmer' }
    ],
    tester: [
      { title: 'Huvudgranskning', content: 'Genomför fullständig granskning enligt Diggs tillsynsmanual - Digg: https://www.digg.se/kunskap-och-stod/digital-tillganglighet/tillsynsmanual-for-granskning-av-webbsidor' },
      { title: 'Tillgänglighetsredogörelse finns/är uppdaterad', content: '(obligatorisk för offentliga aktörer)' },
      { title: 'Genomgång av resultat med teamet', content: 'Åtgärdsplan framtagen för identifierade problem' },
      { title: 'Status bekräftad', content: 'Tidigare åtgärder verifierade som genomförda' }

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