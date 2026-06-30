import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyACSmOPb8_An_eyflC1bfhFGQuYRsY2cCg",
  authDomain: "holy-way-9800e.firebaseapp.com",
  projectId: "holy-way-9800e",
  storageBucket: "holy-way-9800e.firebasestorage.app",
  messagingSenderId: "311183152434",
  appId: "1:311183152434:web:ae5b654af53354d2e3332b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const batch1 = [
  {
    "name": "Shrine Of Our Lady Of Grace",
    "churchType": "Parish",
    "denomination": "Catholic",
    "parishPriest": "Fr. Katherametla Ramesh Babu, MC (2018 - till date)",
    "patron": "Our Lady of Grace",
    "feastDay": "2nd Sunday of November",
    "address": "Shrine of our Lady of Grace Ave Maria Nagar, Aliabad P.O. Medchal Dt. - 500 078, Telangana.",
    "city": "Aliabad",
    "archdiocese": "Hyderabad"
  },
  {
    "name": "St. Joseph's Church",
    "churchType": "Parish",
    "denomination": "Catholic",
    "parishPriest": "Fr. Thathireddy Anil (2024 - till date)",
    "patron": "St. Joseph",
    "feastDay": "March 19th & June 29th (in honour of St. Paul - Vanabhojanam)",
    "address": "St. Joseph's Church Alirajpet P.O., Jagdevpur Mandal Gajwel Thaluk, Siddipet Dt. - 502 281, Telangana.",
    "city": "Alirajpet",
    "archdiocese": "Hyderabad"
  },
  {
    "name": "St. Francis Xavier Church",
    "churchType": "Parish",
    "denomination": "Catholic",
    "parishPriest": "Fr. T. Balaswamy (2020 - till date)",
    "patron": "St. Francis Xavier",
    "feastDay": "3rd December",
    "address": "C/o Loyola Academy, Old Alwal Secunderabad - 500 010, T.S.",
    "city": "Alwal",
    "archdiocese": "Hyderabad"
  },
  {
    "name": "St. Bernard's Church",
    "churchType": "Parish",
    "denomination": "Catholic",
    "parishPriest": "Fr. Mettu Arogyam (2026 - till date)",
    "patron": "St. Bernard",
    "feastDay": "20 August",
    "address": "St. Bernard's Church Ammuguda, J. J. Nagar Colony P.O. Secunderabad - 500 087, T.S.",
    "city": "Ammuguda",
    "archdiocese": "Hyderabad",
    "id": "ooyPw8YkIa7U7OFGt7Bs"
  },
  {
    "name": "Sacred Heart Church",
    "churchType": "Parish",
    "denomination": "Catholic",
    "parishPriest": "Fr. Daniel Selvaraj (2020 - till date)",
    "patron": "Sacred Heart of Jesus",
    "feastDay": "14th July",
    "address": "Sacret Heart Church H.No. 1-18/1/2 Beside St. Ann's High School Perkit, Kotarmoor, Armoor Nizamabad Dt. - 503 224, T.S.",
    "city": "Armoor",
    "archdiocese": "Hyderabad"
  }
];

const main = async () => {
  const churchesCol = collection(db, 'churches');
  for (const parish of batch1) {
    if (parish.id) {
      const id = parish.id;
      delete parish.id;
      const docRef = doc(db, 'churches', id);
      await updateDoc(docRef, parish);
      console.log(`Updated ${parish.name}`);
    } else {
      await addDoc(churchesCol, parish);
      console.log(`Inserted ${parish.name}`);
    }
  }
  process.exit(0);
};

main().catch(console.error);
