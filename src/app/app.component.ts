import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as XLSX from 'xlsx';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { OrgUser } from './models/org-user.model';
import { OrgHierarchyValidatorService } from './services/org-hierarchy-validator.service';
import { UserRoleError } from './models/roles-error.model';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    NgbPaginationModule,
    FormsModule,
    NgIf,
    NgFor
  ],
})
export class AppComponent {

  orgUsers: OrgUser[] = [];
  errors: UserRoleError[] = [];
  page = 1;
  pageSize = 10;
  itemPerPageOptions:number[] = [10,15,20,25,30,35,40,45,50];
  collectionSize = 0;
  displayUsers: OrgUser[] = [];

  constructor(
    private validatorService: OrgHierarchyValidatorService,
  ) { }

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files?.length != 1) return;
    const file: File = target.files[0];
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const baseString: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(baseString, { type: 'binary' });
      const firstWorksheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[firstWorksheetName];
      const data = <any[]>XLSX.utils.sheet_to_json(worksheet);
      this.orgUsers = data.map(row => ({ ...row, RowId: row.__rowNum__ }));
      this.collectionSize = this.orgUsers.length;
      this.errors = this.validatorService.validateHierarchy(this.orgUsers);
      this.refreshUserList();
    };
    reader.readAsBinaryString(file);
  }

  refreshUserList() {
    this.displayUsers = this.orgUsers.map(user => user).slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }

}
