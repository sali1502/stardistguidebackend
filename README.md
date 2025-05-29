# Guide för webbtillgänglighet - Stardist

Detta repository innehåller koden för ett REST API byggt med <strong>Hapi.js</strong>.<br>

API:ets syfte är att hantera projekt med <strong>rollbaserade checklistor</strong> och <strong>inlägg</strong> för utvecklingsteam.<br>
Systemet stödjer rollera <strong>Admin</strong>, <strong>Designer</strong>, <strong>Developer</strong> och <strong>Tester</strong>, med specifika behörigheter.<br>
En <strong>progressionsbar</strong> reflekterar avklarade moment i realtid.<br>

Funktionaliteten baseras på CRUD (Create, Read, Update, Delete) med <strong>JWT-baserad</strong>, <strong>rollstyrd autentisering</strong>.<br>

## Installation och databas
API:t använder en <strong>MongoDB Atlas databas</strong>.<br>
Klona ner källkodsfilerna, kör kommando npm install för att installera nödvändiga npm-paket.
Kör installations-skriptet install.js. Installations-skriptet skapar en databascollection enlig nedan:<br>

<table>
<tr>
  <th>Collection</th>
  <th>Fält</th>
</tr>
<tr>
  <td>Users</td>
  <td><strong>id</strong>(ObjectId), <strong>username</strong>(String), <strong>password</strong>(String), <strong>role</strong>(String), <strong>createdAt</strong>(Date), <strong>updatedAt</strong>(Date)</td>
</tr>
<tr>
  <td>Projects</td>
  <td><strong>id</strong>(ObjectId), <strong>name</strong>(String), <strong>createdAt</strong>(Date), <strong>updatedAt</strong>(Date)</td>
</tr>
<tr>
  <td>Checklists</td>
  <td><strong>id</strong>(ObjectId), <strong>projectId</strong>(ObjectId), <strong>role</strong>(String), <strong>items * </strong>(Array), <strong>createdAt</strong>(Date), <strong>updatedAt</strong>(Date)</td>
</tr>
<tr>
  <td>Posts</td>
  <td><strong>id</strong>(ObjectId), <strong>title</strong>(String), <strong>content</strong>(String), <strong>role</strong>(String), <strong>createdAt</strong>(Date), <strong>updatedAt</strong>(Date)</td>
</tr>
<tr>
  <td>Progress</td>
  <td><strong>id</strong>(ObjectId), <strong>projectId</strong>(ObjectId), <strong>role</strong>(String), <strong>completedItems</strong>(Number), <strong>lastUpdated</strong>(Date)</td>
</tr>                                                                                                                                                                                              
</table> 

\* items [] i Checklists är en array av objekt med fält: title, content, completed.
        
## Användning
Nedan finns beskrivet hur man kan nå API:et på olika vis:

<table>
<tr>
  <th>Metod</th>
  <th>Endpoint</th>
  <th>Beskrivning</th>
  <th>Behörighet</th>
</tr>
<th>Users</th>
<tr>
  <td>GET</td>
  <td>/users</td>
  <td>Hämta alla användare</td>
  <td>Endast admin</td>
</tr>
<tr>
  <td>GET</td>
  <td>/users/{id}</td>
  <td>Hämta en användare med angivet id</td>
  <td>Admin eller användare själv</td>
  </tr>
<tr>
  <td>POST</td>
  <td>/users/login</td>
  <td>Logga in med användarnamn och lösenord</td>
  <td>Öppen (ingen auth)</td>
</tr>
<tr>
  <td>POST</td>
  <td>/users</td>
  <td>Skapa en ny användare</td>
  <td>Endast admin</td>
</tr>
<tr>
  <td>PUT</td>
  <td>/users/{id}</td>
  <td>Uppdatera användare ned angivet id</td>
   <td>Endast admin</td>
</tr>
<tr>
  <td>DELETE</td>
  <td>/users/{id}</td>
  <td>Radera användare med angivet id</td>
  <td>Endast admin</td>
</tr>
<th>Projects</th>
<tr>
  <td>GET</td>
  <td>/projects</td>
  <td>Hämta alla projekt</td>
  <td>Alla inloggade användare</td>
</tr>
<tr>
  <td>GET</td>
  <td>/projects/{id}</td>
  <td>Hämta projekt med angivet id</td>
  <td>Alla inloggade användare</td>
  </tr>
<tr>
  <td>POST</td>
  <td>/projects</td>
  <td>Skapa nytt projekt</td>
  <td>Endast admin</td>
</tr>
<tr>
  <td>PUT</td>
  <td>/projects/{id}</td>
  <td>Uppdatera projekt med angivet id</td>
  <td>Endast admin</td>
</tr>
<tr>
  <td>DELETE</td>
  <td>/projects/{id}</td>
  <td>Radera projekt med angivet id</td>
   <td>Endast admin</td>
</tr>
<th>Progress</th>
<tr>
  <td>GET</td>
  <td>/progress</td>
  <td>Hämta all progressionsstatus</td>
  <td>Alla inloggade användare</td>
</tr>
<tr>
  <td>GET</td>
  <td>/progress/{projectId}</td>
  <td>Hämta progressionsstatus för specifikt projekt</td>
  <td>Alla inloggade användare</td>
  </tr>
  <th>Posts</th>
<tr>
  <td>GET</td>
  <td>/posts</td>
  <td>Hämta alla inlägg</td>
  <td>Admin eller användare med rollen</td>
</tr>
<tr>
  <td>GET</td>
  <td>/post/{id}</td>
  <td>Hämta inlägg med angivet id</td>
  <td>Admin eller användare med rollen</td>
  </tr>
<tr>
  <td>POST</td>
  <td>/post</td>
  <td>Skapa nytt inlägg</td>
  <td>Endast admin</td>
</tr>
<tr>
  <td>PUT</td>
  <td>/post/{id}</td>
  <td>Uppdatera inlägg med angivet id</td>
  <td>Endast admin</td>
</tr>
<tr>
  <td>DELETE</td>
  <td>/post/{id}</td>
  <td>Radera inlägg med angivet id</td>
   <td>Endast admin</td>
</tr>
   <th>Checklists</th>
<tr>
  <td>GET</td>
  <td>/checklists/{projectId}/{role}</td>
  <td>Hämta checklista för specifikt projekt och roll</td>
  <td>Admin eller användare med rollen</td>
</tr>
<tr>
  <td>POST</td>
  <td>/checklists/{projectId}/{role}/items</td>
  <td>Lägg till checklistpunkt</td>
  <td>Endast admin</td>
</tr>
<tr>
  <td>PUT</td>
  <td>/checklists/{projectId}/{role}/items/{itemId}</td>
  <td>Uppdatera checklistpunkt</td>
  <td>Endast admin</td>
</tr>
<tr>
  <td>DELETE</td>
  <td>/checklists/{projectId}/{role}/items/{itemId}</td>
  <td>Radera checklistpunkt</td>
  <td>Endast admin</td>
</tr>
<tr>
  <td>PATCH</td>
  <td>/checklists/{projectId}/{role}/toggle</td>
  <td>Markera checklistpunkt som klar/inte klar</td>
  <td>Användare med rollen (rollbaserad åtkomst)</td>
</tr>
</table>

## Autentisering
- Logga in via /users/login för att få JWT-token<br>
- Skicka med token i Authorization-headern som:<br>
Authorization: Bearer <token><br>
- Token krävs för alla skyddade endpoints

## Felhantering och validering
- API:et använder Joi för payload-validering och Boom för felhantering<br>
- Vid valideringsfel retuneras statuskod 400 med felmeddelande<br>
- Obefogad åtkomst retunerar 403 Forbidden<br>

## Exempel: Logga in<br>
Ett objekt med användaruppgifter skickas i JSON-format:<br>

POST /users/login
```
    {
      "username": "Admin123",
      "password": "hemligt"
    }
```
Svar från servern:<br>
```
    {
      "token": "eyJhbGi0iJUzI1NisInRc5Ci6..."
    }
```
