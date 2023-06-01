import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { NgForm } from '@angular/forms';

interface UserProfile {
  accountType: string;
  solde: string;
  rib: string;
}

interface UserData {
  account: { [key: string]: UserProfile };
  solde: string;
  rib: string;
}

interface CardRequest {
  accountType: string;
  rib: string;
  // Ajoutez d'autres propriétés nécessaires pour la demande de carte
}

interface Card {
  accountType: string;
  rib: string;
  // Ajoutez d'autres propriétés nécessaires pour les cartes
}

@Component({
  selector: 'app-request-account',
  templateUrl: './request-account.component.html',
  styleUrls: ['./request-account.component.css']
})
export class RequestAccountComponent implements OnInit {
  Uid: string | undefined;
  dataProfile: UserProfile = {
    solde: '10.000',
    accountType: '',
    rib: ''
  };
  name: string | undefined;
  newAccount: UserData = {
    account: {},
    solde: '10.000',
    rib: ''
  };
  userAccounts: UserProfile[] = [];
  cardRequest: CardRequest = {
    accountType: '',
    rib: ''
  };
  cards: Card[] = [];

  constructor(
    private as: AuthService,
    private fs: AngularFirestore,
    private router: Router
  ) {
    this.as.user.subscribe((user) => {
      if (user) {
        this.Uid = user.uid;
      }
    });
  }

  ngOnInit(): void {
    this.as.user.subscribe((user) => {
      if (user) {
        this.Uid = user.uid;

        this.fs.collection<UserProfile>('users').doc(this.Uid).valueChanges().subscribe((userData) => {
          if (userData) {
            this.dataProfile = userData;
          }
        });

        this.fs.collection<UserData>('users').doc(this.Uid).valueChanges().subscribe((userData) => {
          if (userData && userData.account) {
            this.userAccounts = Object.values(userData.account);
          }
        });

        this.fs.collection("users").ref.doc(localStorage.getItem("userConnect") || '').get().then((doc) => {
          const data = doc.data() as UserProfile;
          console.log(data);
          this.dataProfile.solde = data?.solde ?? '10.000';
          this.dataProfile.accountType = data?.accountType ?? '10.000';
          this.dataProfile.rib = data?.rib ?? '';
        });
      }
    });
  }

  submitAccountForm(accountForm: NgForm) {
    if (accountForm.valid) {
      const accountData = accountForm.value;

      this.fs.collection<UserData>('users').doc(this.Uid).update({
        [`account.${accountData.accountType}`]: {
          accountType: accountData.accountType,
          solde: '',
          rib: ''
        }
      })
      .then(() => {
        this.userAccounts.push({
          accountType: accountData.accountType,
          solde: '',
          rib: ''
        });

        accountForm.resetForm();
      })
      .catch((error) => {
        console.error('Error saving account data:', error);
      });
    }
  }

  submitCardRequestForm(cardRequestForm: NgForm) {
    if (cardRequestForm.valid) {
      const cardRequestData = cardRequestForm.value;

      // Effectuez les opérations nécessaires pour enregistrer la demande de carte dans la base de données ou ailleurs
      console.log('Demande de carte enregistrée avec succès.');

      this.cards.push({
        accountType: cardRequestData.accountType,
        rib: cardRequestData.rib
      });

      cardRequestForm.resetForm();
    }
  }
}
