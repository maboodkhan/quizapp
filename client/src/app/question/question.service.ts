import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Http, Response } from '@angular/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private apiUrl = environment.apiUrl;

  constructor(private http: Http) { }



  getClassSections(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/sections/getsections`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }


  getBoards(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/boards/getboards`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getClasses(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/classes/getclasses`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getSubjects(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/subjects/getsubjects`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getLessons(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/lessons/getlessons`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getTopics(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/topics/gettopics`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getTopicQuestions(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/syllabus_questions/getAllQuestions`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getAllTopicQuestions(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/syllabus_questions/getAllQuestions`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  // getIssueQuestions(paramsVal: any): Observable<any[]>{
  //   return this.http.post(`${this.apiUrl}/syllabus_questions/getIssueQuestions`, paramsVal)
  //     .map((response: Response) => {
  //       return response.json();
  //   })
  //   .catch(this.handleError);
  // }


  getQuestion(paramsVal: any): Observable<any[]>{
    return this.http.get(`${this.apiUrl}/questions/getQuestion/` + paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }


  updateQuestion(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/questions/updateQuestion`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  addQuestion(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/questions/addQuestion`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }


  getLevels(): Observable<any[]>{
    return this.http.get(`${this.apiUrl}/levels/getLevel`)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getBoardById(paramsVal: any): Observable<any[]> {
    return this.http.get(`${this.apiUrl}/boards/getboard/`+ paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }


  getClassById(paramsVal: any): Observable<any[]> {
    return this.http.get(`${this.apiUrl}/classes/getClass/`+ paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getSubjectById(paramsVal: any): Observable<any[]> {
    return this.http.get(`${this.apiUrl}/subjects/getSubject/`+ paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getLessonById(paramsVal: any): Observable<any[]> {
    return this.http.get(`${this.apiUrl}/lessons/getLesson/`+ paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getTopicById(paramsVal: any): Observable<any[]>{
    return this.http.get(`${this.apiUrl}/topics/getTopic/`+ paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  uploadQuestion(file: object): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/questions/quesupload`, file)
      .pipe(map((response: Response) => {
        return response.json();
      })
    ).
    catch(this.handleError);
  }

  deleteOption(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/answers/deleteOption`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getAssignUsers(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/users/getAssignUsers`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  
  assignQuestion(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/questions/assignQuestion`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  removeAssignQue(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/questions/removeAssignQue`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  updateQcDone(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/questions/updateQcDone`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getRemark(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/question_remarks/getRemark`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  addRemark(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/question_remarks/addRemark`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  addPermission(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/question_permissions/addPermission`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  findPermission(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/question_permissions/findPermission`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  addUserLessons(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/user_assign_lessons/addUserLessons`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }
 
  getUserLessons(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/user_assign_lessons/getUserLessons`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  
  getQuestionIssue(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/question_issues/getQuestionIssue`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  viewIssueList(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/question_issues/viewIssueList`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  
  getQueIssueById(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/question_issues/getQueIssueById`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  
  updateQueIssueById(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/question_issues/updateQueIssueById`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getUserIssueList(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/question_issues/getUserIssueList`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  deleteIssue(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/question_issues/deleteIssue`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getPreviousData(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/question_previous_data/getPreviousData`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  questionLogs(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/question_qc_logs/questionLogs`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getPollQuestions(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/poll_questions/getPollQuestions`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  addUserAnswer(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/poll_user_answers/addUserAnswer`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getPollResult(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/poll_user_answers/getPollResult`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  changeSyllabus(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/syllabus_questions/changeSyllabus`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }
  
  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error.json());
    return Observable.throw(error.json().error || 'Server error');
  }
}
