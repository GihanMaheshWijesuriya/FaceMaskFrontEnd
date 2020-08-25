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

  constructor(private appService: AppService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.getAllFaceDetails();
  }

  getInformations() {
    this.includedTimes = [];
    if (this.faceMaskForm.valid) {
      const selectedTime = new Date(this.inTIme.value);
      const endShiftTime = new Date(this.outTIme.value);
      const startRange = new Date(this.inTIme.value);
      const endRange = new Date(this.inTIme.value);
      new Date(endRange.setMinutes(endRange.getMinutes() + 20));
      new Date(startRange.setMinutes(startRange.getMinutes() - 20));

      for (let i = 0; i < this.faceMaskDetails.length; i++) {
        const tempDate = new Date(this.faceMaskDetails[i].checkTime);
        this.faceMaskDetails[i].checkTime = this.datePipe.transform(tempDate, 'yyyy-MM-dd HH:mm:ss');

        if (startRange <= tempDate && tempDate <= endRange) {
          this.faceMaskDetails[i].status = 'in';
          this.includedTimes.push(this.faceMaskDetails[i]);
        } else if (tempDate <= startRange) {
          this.faceMaskDetails[i].status = 'error';
          this.includedTimes.push(this.faceMaskDetails[i]);
        } else if (startRange <= tempDate && tempDate <= endShiftTime) {
          this.faceMaskDetails[i].status = 'leave';
          this.includedTimes.push(this.faceMaskDetails[i]);
        } else {
          this.faceMaskDetails[i].status = 'error';
          this.includedTimes.push(this.faceMaskDetails[i]);
        }

        if ((this.faceMaskDetails.length - 1) === i) {
          this.appService.exportAsExcelFile(this.includedTimes, 'sample');
        }
      }
    } else {
      this.faceMaskForm.markAllAsTouched();
    }
  }

  private getAllFaceDetails() {
    this.appService.getAllDetails()
      .subscribe(res => {
        this.faceMaskDetails = res;
      }, error1 => {
        console.log(error1);
      });
  }
}
