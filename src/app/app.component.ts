import { Component } from '@angular/core';
import * as moment from 'moment'; 
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { FilterPipe } from './filter.pipe';
import { Events } from './event';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
	selected:any; // this variable will store the current day
	month:any;	
	weeks:any;
	events:Events[];	// list of events will be stored in here, 
	eventsaved:boolean; // flag to show success message
	editEventIndex:number=-1; // flag to find which event we will edit, -1 present that we will perform an add function
	rForm: FormGroup; // this will be Reactive form
	
	constructor(private modalService: NgbModal, private fb: FormBuilder){
		var storedEvents= JSON.parse(localStorage.getItem('Events'));
		if(storedEvents!=null){
			this.events = storedEvents;
		}else{
			this.events = [];
		}
		this.weeks = [];
		this.eventsaved=false;
		this.curmonth();
		this.rForm = fb.group({
			'title': [null, Validators.required],
			'description': [null, Validators.required]
		});
	}
	
	// this function will insert the new data into the event array, and then we will rebuild calandar
	addevent(post){
		if(post.valid){
			this.events.push({title: post.value.title, description: post.value.description, date: this.selected.format("M/D/Y") });
			localStorage.setItem('Events', JSON.stringify(this.events));
			this.rebuildcalandar(this.selected);
			this.eventsaved=true;
			post.reset();
			setInterval (() => {
				this.eventsaved=false;
			}, 2000)
		}
	}
	
	updateevent(post){
		if(post.valid){
			this.events[this.editEventIndex].title=post.value.title;
			this.events[this.editEventIndex].description= post.value.description;
			localStorage.setItem('Events', JSON.stringify(this.events));
			this.rebuildcalandar(this.selected);
			this.eventsaved=true;
			post.reset();
			setInterval (() => {
				this.eventsaved=false;
			}, 2000)
		}
	}
	
	deleteevent(i){
		this.events.splice(i, 1);
		localStorage.setItem('Events', JSON.stringify(this.events));
		this.rebuildcalandar(this.selected);
	}
	
	// using this function we will not just remove data from our array but we will also clear local storage variables
	clearEvents(){
		if(confirm("Are you sure to clear all events")) {
			localStorage.removeItem('Events');
			this.events=[];
			this.rebuildcalandar(this.selected);
		}
	}
	
	// this is to pre-populate data in the form and open the form popup, 
	editeventpopup(i, content){
		this.editEventIndex=i;
		this.eventsaved=false;
		this.rForm.reset({
			'title': this.events[i].title,
			'description': this.events[i].description
		});
		this.modalService.open(content);
	}
	
	// this will open a fresh form to add new event in the bootstrap popup
	addeventpopup(content){
		this.editEventIndex=-1;
		this.eventsaved=false;
		this.rForm.reset();
		this.modalService.open(content);
	}
	
	// we will use this function to find the event for the date in the arguments
	findevent(date){
		var events=[];
		this.events.forEach(function(event){
			if(date.format("M/D/Y")==event.date ){
				events.push(event);
			}
		});
		return events;
    }
	
	// We use this function to rebuild calandar with new data
	rebuildcalandar(selected){
		this.selected = selected;
		this.month = this.selected.clone();
		var start = this.selected.clone();
		start.date(1);
		this.removeTime(start.day(0));
		this.buildMonth(start, this.month);
	}
	
	removeTime(date) {
        return date.hour(0).minute(0).second(0).millisecond(0);
    }
	
	buildMonth(start, month){
		this.weeks = [];
		var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
		while (!done) {
			this.weeks.push({ days: this.buildWeek(date.clone(), month) });
			date.add(1, "w");
			done = count++ > 2 && monthIndex !== date.month();
			monthIndex = date.month();
		}
	}

	buildWeek(date, month){
		var days = [];
		for (var i = 0; i < 7; i++){
			days.push({
				name: date.format("dd").substring(0, 1),
				number: date.date(),
				isCurrentMonth: date.month() === month.month(),
				isToday: date.isSame(new Date(), "day"),
				date: date,
				events: this.findevent(date)
			});
			date = date.clone();
			date.add(1, "d");
		}
		return days;
	}
	
	select(day){
		this.selected = day.date;
	}

	next(){
		var next = this.month.clone();
		this.removeTime(next.month(next.month()+1).date(1));
		this.month.month(this.month.month()+1);
		this.month=moment(this.month);
		this.buildMonth(next, this.month);
	}
	
	curmonth(){
		this.rebuildcalandar(this.removeTime(moment()));
	}

	previous(){
		var previous = this.month.clone();
		this.removeTime(previous.month(previous.month()-1).date(1));
		this.month.month(this.month.month()-1);
		this.month=moment(this.month);
		this.buildMonth(previous, this.month);
	}
}
