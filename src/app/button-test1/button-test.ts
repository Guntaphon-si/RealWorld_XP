import { Component } from '@angular/core';
import { DataService } from '../shared/data';
import { Router } from '@angular/router';
@Component({
  selector: 'app-button-test',
  imports: [],
  templateUrl: './button-test.html',
  styleUrl: './button-test.css'
})
export class ButtonTest {
  constructor(
    private userIdDataService: DataService,
    private router: Router
  ){}
  onSubmit(){
    this.userIdDataService.updateUserId(1);
    this.router.navigate(["/assessment"])
  }
}
