"use strict";
// Конструктор событии
class Events {
    constructor() {
        this.obj = [];
        this.value = null;
        this.create = this.create.bind(this);
        this.remove = this.remove.bind(this);
        this.addEvent = this.addEvent.bind(this);
        this.removeAll = this.removeAll.bind(this);
        this.remove_dom_slice_all = this.remove_dom_slice_all.bind(this);
        this.remove_elements_global_event = this.remove_elements_global_event.bind(this)
    }

    /*
    * obj - массив элементов DOM
    * event - имя события
    * func - функция реагирования на событие
    * options - доп опции
    * options['filter'] - фильтрация DOM элементов к которым нужно присвоить событие
    * */
    create(obj, event,func, options){
        this.value = {'dom': obj, 'event_type': event, 'callback':func};
        new Promise(this.addEvent).then((e)=>{
            e.forEach(el => {
                if (typeof el['dom'] == "string") {
                    if (document.getElementById(el['dom'])) {
                        document.getElementById(el['dom']).addEventListener(el['event_type'], el['callback'], false);
                    }
                } else {
                    el['dom'].addEventListener(el['event_type'], el['callback'], false);
                }
            });
        }).catch(e => {
            console.log(e);
        });
    }

    // Функция для записи в глобальный объект новых событии
    addEvent(resolve,reject){
        if (this.value['dom']) {
            // Все события хранятся в этой переменной
            let events_add = [];

            if (Array.isArray(this.value['dom']) === false && (this.value['dom'].length === undefined || typeof this.value['dom'] === 'string')){
                this.value['dom'] = [this.value['dom']];
            }
            // console.log(this.value)
            for (let add of this.value['dom']) {
                // this.value['dom'].forEach((add,i,arr)=>{
                if (Array.isArray(this.value['event_type']) === false && Array.isArray(this.value['callback']) === false) {
                    if (this.obj.length === 0) {
                        let st = {
                            'dom': add,
                            'event_type': this.value['event_type'],
                            'callback': this.value['callback']
                        };
                        if (st in this.obj === false) {
                            this.obj = [st];
                            events_add.push(st)
                        }
                    } else {
                        let st = {
                            'dom': add,
                            'event_type': this.value['event_type'],
                            'callback': this.value['callback']
                        };
                        if (st in this.obj === false) {
                            this.obj.push(st);
                            events_add.push(st)
                        }
                    }
                } else if (Array.isArray(this.value['event_type'])) {
                    // Если множество событии
                    this.value['event_type'].forEach(ev_type => {
                        let st = {
                            'dom': add,
                            'event_type': ev_type,
                            'callback': this.value['callback']
                        };
                        if (st in this.obj === false) {
                            this.obj.push(st);
                            events_add.push(st)
                        }
                    });
                }
                if (Array.isArray(this.value['callback'])) {
                    // Если множество каллбэков
                    this.value['callback'].forEach(fn => {
                        let st = {
                            'dom': add,
                            'event_type': this.value['event_type'],
                            'callback': fn
                        };
                        if (st in this.obj === false) {
                            this.obj.push(st);
                            events_add.push(st);
                        }
                    });
                }
            }
            // });
            resolve(events_add);
        } else {
            reject(this.value['dom']);
        }
    }

    // Удаление события у конкретного DOM элемента
    remove(obj,event,func) {
        // Если необходимо удалить все события DOM элемента или частичное удаление
        if (this.obj.length === 0){
            console.info("Нет зарегистрированных событии");
            return false;
        } else if (obj === undefined || obj === null) {
            console.error('Небыл передан DOM элемент');
            return false;
        } else {
            if (event === null || event === undefined || func === null || func === undefined) {
                this.remove_dom_slice_all(obj, event, func);
            }
            if (Array.isArray(obj)) {
                if (obj.length > 0) {
                    for (let el of obj) {
                        el.removeEventListener(event, func);
                        this.obj.filter(or_el => {
                            return or_el['dom'] !== el
                        });
                    }
                }
            } else {
                obj.removeEventListener(event, func);
                this.obj.filter(el => {
                    return el['dom'] !== obj
                })
            }
            return true
        }
    }

    // Удаления всех событии у конкретного DOM элемента
    remove_dom_slice_all(obj, event, func){
        if (Array.isArray(obj)){
            new Promise(  (resolve,reject) => {
                for (let el of obj) {
                    // this.remove_elements_global_event.prototype.resolve = resolve;
                    // this.remove_elements_global_event.prototype.reject = reject;
                    this.remove_elements_global_event(el, event, func);
                }
            });
        } else {
            this.remove_elements_global_event(obj, event, func);
        }
    }

    // Логика удаления
    remove_elements_global_event(obj, event, func){
        let event_rm = {};
        if (event === null || event === undefined && func === null || func === undefined) {
            this.obj=this.obj.filter(or_el => {
                if (or_el['dom'] === obj) {
                    event_rm = or_el;
                    event_rm['dom'].removeEventListener(event_rm['event_type'], event_rm['callback']);
                    return false
                } else {
                    return true
                }
            });
        } else if (func !== null && func !== undefined){
            this.obj=this.obj.filter(or_el => {
                if (or_el['dom'] === obj && or_el['callback'] === func) {
                    event_rm = or_el;
                    event_rm['dom'].removeEventListener(event_rm['event_type'], event_rm['callback']);
                    return false
                } else {
                    return true
                }
            });
        } else if (event !== null && event !== undefined) {
            this.obj=this.obj.filter(or_el => {
                if (or_el['dom'] === obj && or_el['event_type'] === event) {
                    event_rm = or_el;
                    event_rm['dom'].removeEventListener(event_rm['event_type'], event_rm['callback']);
                    return false
                } else {
                    return true
                }
            });
        }
    }

    // Удалить все события
    removeAll(){
        if (this.obj.length > 0){
            for (let el of this.obj){
                el['dom'].removeEventListener(el['event_type'], el['callback']);
            }
            this.obj = [];
        } else {
            console.info('Нет не одного зарегистрированного события');
        }
    }
}

// window.$events = new Events();
export {Events}