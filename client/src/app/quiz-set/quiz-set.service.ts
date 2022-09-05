import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Http, Response } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class QuizSetService {

  private apiUrl = environment.apiUrl;

  constructor(private http: Http) { }

  asgnQuizSetSchools(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/quiz_set_schools/assignSchoolQuizSet`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }
  
  getQuizSetSchools(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/schools/getquizsetschools`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getClassSections(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/sections/getsections`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getQuizSets(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/quiz_sets/getallquizsets`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getQuizSetQues(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/attempted_quiz_sets/getquizsetques`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getPostQuizSetQues(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/post_attempted_quiz_sets/getquizsetques`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getUserQuizSetDetails(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/attempted_quiz_sets/getquizsetdetails`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getPostUserQuizSetDetails(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/post_attempted_quiz_sets/getquizsetdetails`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }


  getQuizSetsData(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/attempted_quiz_sets/getFilteredQuizData`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getQuizSetDetails(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/quiz_sets/getquizsetdetails`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getPostQuizSetDetails(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/post_quiz_sets/getquizsetdetails`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  saveQuizSet(paramsVal: any): Observable<any[]> {
    if (paramsVal.id === null){
      return this.createQuizSet(paramsVal);
    }
  }

  getBoards(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/boards/getboards`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getClasses(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/classes/getclasses`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getSubjects(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/subjects/getsubjects`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getLessons(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/lessons/getlessons`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getTopics(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/topics/gettopics`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getTopicQuestions(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/syllabus_questions/getquestions`, paramsVal)
      .map((response: Response) => {
        return response.json();
    });
  }

  createQuizSet(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/quiz_sets/create`, paramsVal)
      .map((response: Response) => {
        //console.log(response.json());
        return response.json();
      })
      .catch(this.handleError);
  }


  deleteQuiz(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/quiz_sets/deleteQuiz`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }


  questionForPreview(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/questions/questionForPreview`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

 classSectionsById(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/class_sections/getClassSections`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getQuizSetClassInfo(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/quiz_syllabus_details/getQuizSetClassInfo`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getPostQuizSetClassInfo(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/post_quiz_syllabus_details/getQuizSetClassInfo`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getQuizSetSectionInfo(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/quiz_syllabus_details/getQuizSetSectionInfo`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getCountryLessons(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/country_lessons/getlessons`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getCountryMapLessons(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/country_lesson_mappings/getlessons`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getCountrySchool(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/schools/getCountrySchool`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error.json());
    return Observable.throw(error.json().error || 'Server error');
  }
}
