import {LocalStorageHelper} from '../../helpers/local-storage-helper';
import {getCatalogCheck,isCatalogSelectionValid} from '../../helpers/game-catalog';

const hints:Record<string,{title:string;text:string}>={
    'automate-massen-ut':{title:'Massen-UT automatisch vorbereiten',text:'Wendet deine SD-Gruppe, Truppen-Vorlage und Filter an, wenn du dem Link einer SD-Anfrage folgst. Gruppe und Vorlage müssen eingerichtet sein. Prüfe die vorausgewählten Dörfer und Truppen; du sendest selbst im Spiel.'},
    'prevent-duplicate-destination':{title:'Doppeltes Schicken',text:'Aus / ohne Häkchen: Bereits bearbeitete SD-Anfragen sind vor erneuter Vorauswahl geschützt. An / mit Häkchen: Sie dürfen erneut vorausgewählt werden. Aktiviere das nur, wenn du bewusst weitere Pakete schicken möchtest.'},
    'sd-sort-by':{title:'Sortieren nach',text:'Sortiert die Herkunftsdörfer für Massen-UT nach der gewählten Einheit. Ohne Auswahl bleibt die normale Spielsortierung bestehen.'},
    'sd-group-id':{title:'SD-Gruppe',text:'Wähle die Dorfgruppe, aus der du Standdeff verschicken möchtest. Gruppen werden direkt aus der Gruppenverwaltung geladen. Grün bedeutet: Die gewählte Gruppe wurde im Spiel gefunden und zugeordnet. Die Truppen in den Dörfern prüfst du vor dem Versand.'},
    'sd-template-id':{title:'SD-Vorlage',text:'Wähle die Truppen-Vorlage mit den Paketmengen eurer SD-Tabelle. Vorlagen werden direkt von der Vorlagenseite geladen. Grün bestätigt die vorhandene und zugeordnete Vorlage; prüfe selbst, dass ihre Einheitmengen zu euren Paketen passen.'},
    'sd-schwertLfz':{title:'Schwert-Laufzeit',text:'Normale Schwert-Laufzeit dieser Welt in Minuten pro Feld, ohne Unterstützungs-Speedboost. Sie wird für ab/bis-Anfragen und die Erkennung eines Speedboosts verwendet. Ein positiver Zahlenwert ist gültig; den Wert findest du in den Welteinstellungen.'},
    'reset-thread-packages':{title:'Geschickte Pakete zurücksetzen',text:'Löscht die lokal gespeicherten Versand-Einträge dieses Threads. Die Forenbeiträge bleiben bestehen. Danach können bereits bearbeitete Anfragen wieder vorausgewählt werden.'}
};

export function getSettingsHelp($root:JQuery<HTMLElement>) {
    return Object.entries(hints).filter(([id])=>$root.find(`#${id}`).length>0).map(([,hint])=>hint);
}

export function initializeSettingsHelp($root:JQuery<HTMLElement>,storage:LocalStorageHelper) {
    const native=$root.is('[data-sd-native-settings]');
    if (!native) return;
    const render=()=>{
        const group=isCatalogSelectionValid('groups',storage.getSdGroupId);
        const template=isCatalogSelectionValid('templates',storage.getSelectedTemplate);
        const catalogState=(kind:'groups'|'templates',selected:string)=>{
            const check=getCatalogCheck(kind);
            if (isCatalogSelectionValid(kind,selected)) return {ready:true,text:'Im Spiel bestätigt'};
            if (!selected || selected==='0') return {ready:false,text:'Bitte auswählen'};
            return {ready:false,text:check.state==='error' ? 'Prüfung fehlgeschlagen' : check.state==='ready' ? 'Nicht gefunden' : 'Wird geprüft'};
        };
        const sword=Number($root.find('#sd-schwertLfz').val());
        const sort=storage.getSortBy;
        const sortValid=sort==='default'||sort===''||game_data.units.some(unit=>unit===sort);
        const states:Record<string,{ready:boolean;text:string}>={
            'sd-group-id':catalogState('groups',storage.getSdGroupId),
            'sd-template-id':catalogState('templates',storage.getSelectedTemplate),
            'sd-schwertLfz':{ready:Number.isFinite(sword)&&sword>0,text:Number.isFinite(sword)&&sword>0 ? 'Gültiger Wert' : 'Bitte einstellen'},
            'automate-massen-ut':{ready:storage.getAutomateMassenUt&&group&&template,text:!storage.getAutomateMassenUt ? 'Aus' : group&&template ? 'Bereit' : 'Gruppe / Vorlage prüfen'},
            'prevent-duplicate-destination':{ready:storage.getPreventDuplicateDestination,text:storage.getPreventDuplicateDestination ? 'Schutz aktiv' : 'Erneute Auswahl erlaubt'},
            'sd-sort-by':{ready:sortValid,text:sort==='default'||sort==='' ? 'Spielsortierung' : sortValid ? 'Einheit gewählt' : 'Bitte auswählen'}
        };
        for(const [id,state] of Object.entries(states)) {
            const $row=$root.find(`#${id}`).closest('tr').toggleClass('sd-setting-ready',state.ready);
            let $status=$row.find('.sd-setting-status');
            if (!$status.length) $status=$('<small class="sd-setting-status">').appendTo($row.children('td').last());
            $status.text(`${state.ready ? '✓ ' : ''}${state.text}`);
        }
    };
    $(document).off('.sdSettingsStatus').on('sd-catalog-updated.sdSettingsStatus sd-catalog-validated.sdSettingsStatus sd-settings-changed.sdSettingsStatus',render);
    render();
}
