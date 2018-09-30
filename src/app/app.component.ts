
import { Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
  

export class AppComponent implements OnInit {

  constructor() { }
  
  title: string = "";
  headers = [];
  rows = [];
 
  ngOnInit() { 

    let modelTable = {
      headers: [
        //{title:"Id",accessor: "id", index: 0, dataType: "number"},
          {
          title: "Profile", accessor: "profile", width: "80px", index: 1, dataType: "O",cell: { type: "image",
              style: {
                "width": "50px",
              }
            }
          },
          { title: "Name", accessor: "name", width: "300px", index: 2, dataType: "S" },
        { title: "Age", accessor: "age", index: 3, dataType: "N" },
        { title: "Rating", accessor: "rating", index: 4, dataType: "N" },
          { title: "Qualification", accessor: "qualification", index: 5, dataType: "N" }
        ],
      data: [
        { id: 1, name: "a", age: 29, qualification: "B.Com", rating: 3, profile: "https://png.icons8.com/nolan/50/000000/user.png" },
        { id: 2, name: "b", age: 35, qualification: "B.Sc", rating: 5, profile: "https://png.icons8.com/nolan/50/000000/user.png" },
        { id: 3, name: "c", age: 42, qualification: "B.E", rating: 3, profile: "https://png.icons8.com/nolan/50/000000/user.png" },
      ]
    }

       for (var i = 4; i <= 20; i++) {
       modelTable.data.push({
         id: i,
         name: "name " + i,
         age: i + 18,
         qualification: "Graduate",
         rating: (i % 2 ? 3 : 4),
         profile: "https://png.icons8.com/dotty/50/000000/cat-profile.png"
       })
     }

    this.title = "This Is A Table"; 
    this.headers = modelTable.headers;
    this.rows = modelTable.data;

  }
}
