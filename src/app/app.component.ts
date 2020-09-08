import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {AppService} from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'FaceMaskFrontEnd';

  faceMaskForm = new FormGroup({
    inTIme: new FormControl('', [Validators.required]),
    outTIme: new FormControl('', [Validators.required])
  });

  get inTIme() {
    return this.faceMaskForm.get('inTIme');
  }

  get outTIme() {
    return this.faceMaskForm.get('outTIme');
  }

  faceMaskDetails: Array<any> = [];
  includedTimes: Array<any> = [];
  todayDate: string;

  constructor(private appService: AppService, private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.getAllFaceDetails();

    const today = new Date();
    const tempDate = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();
    const tempMonth = (today.getMonth() + 1) < 10 ? `0${(today.getMonth() + 1)}` : (today.getMonth() + 1);
    this.todayDate = `${today.getFullYear()}-${tempMonth}-${tempDate}`;
  }

  async getInformations() {
    this.faceMaskDetails = await this.getAllFaceDetails() as Array<any>;

    this.includedTimes = [];
    if (this.faceMaskForm.valid) {

      const selectedTime = new Date(this.inTIme.value);
      const endShiftTime = new Date(this.outTIme.value);
      const startRange = new Date(this.inTIme.value);
      const endRange = new Date(this.inTIme.value);
      // tslint:disable-next-line:no-unused-expression
      new Date(endRange.setMinutes(endRange.getMinutes() + 20));
      // tslint:disable-next-line:no-unused-expression
      new Date(startRange.setMinutes(startRange.getMinutes() - 20));

      console.log(selectedTime);

      if (this.faceMaskDetails.length !== 0) {

        for (let i = 0; i < this.faceMaskDetails.length; i++) {
          // tslint:disable-next-line:no-shadowed-variable
          const tempDate = new Date(this.faceMaskDetails[i].checkTime);
          this.faceMaskDetails[i].checkTime = this.datePipe.transform(tempDate, 'yyyy-MM-dd HH:mm:ss');

          const todayDay = new Date();

          if (tempDate.toDateString() < todayDay.toDateString()) {
            this.faceMaskDetails[i].status = 'previous records';
          } else {
            if (startRange <= tempDate && tempDate <= endRange) {
              this.faceMaskDetails[i].status = 'in';
              this.includedTimes.push(this.faceMaskDetails[i]);
            } else if (tempDate <= startRange) {
              this.faceMaskDetails[i].status = 'error';
              this.includedTimes.push(this.faceMaskDetails[i]);
            } else if (startRange <= tempDate && tempDate <= endShiftTime) {
              this.faceMaskDetails[i].status = 'late';
              this.includedTimes.push(this.faceMaskDetails[i]);
            } else {
              this.faceMaskDetails[i].status = 'error';
              this.includedTimes.push(this.faceMaskDetails[i]);
            }
          }

          if ((this.faceMaskDetails.length - 1) === i) {
            this.appService.exportAsExcelFile(this.includedTimes, 'sample');
          }
        }

      } else {
        console.log('NO USERS AVAILABLE');
      }

    } else {
      this.faceMaskForm.markAllAsTouched();
    }
  }

  async getAllFaceDetails() {
    return new Promise(resolve => {
      this.appService.getAllDetails()
        .subscribe(res => {
          this.faceMaskDetails = res;
          resolve(res);
        }, error1 => {
          console.log(error1);
          resolve(false);
        });
    });
  }
}
