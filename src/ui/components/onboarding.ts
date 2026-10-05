import {LocalStorageHelper} from '../../helpers/local-storage-helper';
import {PageContext} from '../../helpers/script-context';
import {isUserForumMod} from '../../helpers/tw-helper';
import {ensureOrganizerStyles, keepOrganizerInViewport} from './organizer-style';

const VERSION=1;
type Step={target:string; title:string; text:string};
export function getOnboardingSteps(context:PageContext, mod:boolean):Step[] {
    if (context.context === 'forum-new_thread' && mod) return [
        {target:'.sd-package-row',title:'Pakete definieren',text:'Eine Menge in Speer, Schwert oder Bogen skaliert diese Paketzeile. Späher sind 5 %. Ein Klick leert ein befülltes Feld. Weitere Pakete sind unabhängig.'},
        {target:'#setupTable',title:'SD-Tabelle vorbereiten',text:'„SD Tabelle generieren“ füllt den Forenbeitrag aus und schlägt bei leerem Titel „SD Tabelle“ vor. Ein Klick ins Titelfeld entfernt diesen Vorschlag; eigene Titel bleiben erhalten. Prüfe Titel und Text und sende den Thread im Spiel ab.'},
        {target:'input[name=subject]',title:'Thread erstellen und zuordnen',text:'Nach erfolgreichem Erstellen erkennt der Organizer deinen SD-Thread und speichert die Zuordnung. Bestehende Tabellen ordnest du im jeweiligen Thread über „Als SD-Tabelle festlegen“ im SD Organizer zu.'}
    ];
    if (context.context === 'overview-away_detail') return [
        {target:'.sd-preset-buttons',title:'Paketgröße wählen',text:'100 oder 200 Dual enthält Speer und Schwert. Auf Bogenwelten enthält Trial zusätzlich Bogen. Eigene Paketgrößen und Power sind separat einklappbar.'},
        {target:'#sd-bunker-import-thread-id',title:'Ziel-Thread wählen',text:'Der Ziel-Thread muss vorher als SD-Tabelle gespeichert sein. Berechnet werden nur die hier sichtbaren Truppen; prüfe Filter und weitere Seiten.'},
        {target:'#sd-bunker-import-preview',title:'Vorschau prüfen',text:'Markiere die gewünschten Koordinaten. „Unter 5 entfernen“ entfernt auch vorhandene Anfrage-Entwürfe derselben Koordinaten im Ziel-Thread.'},
        {target:'#sd-import-bunker-requests',title:'Entwurf übernehmen',text:'Übernehmen speichert einen Anfrage-Entwurf. Öffne anschließend den Ziel-Thread, klicke „Bunker anfragen“, ergänze Angaben und fülle den Beitrag ein. Erst Senden im Spiel veröffentlicht die Anfrage.'}
    ];
    if (context.context === 'place') return [
        {target:'select[name=template]',title:'Gruppe und Vorlage einrichten',text:'Beim Öffnen der Massen-UT liest der Organizer Gruppen und Vorlagen ein. Wähle sie anschließend im Forum-Organizer oder in den Einstellungen. Aktiviere dort die Massen-UT-Hilfe.'},
        {target:'.troop-request-selector',title:'Auswahl prüfen',text:'Öffne die Massen-UT über den Link der gewünschten SD-Anfrage. Prüfe Vorlage, verfügbare Truppen und Zeitfenster. Der Doppelversandschutz berücksichtigt bereits bearbeitete Anfragen.'},
        {target:'.evt-button-fill',title:'Übernehmen und senden',text:'„Übernehmen“ füllt die Spielauswahl. Prüfe die tatsächlich einzutragenden Einheiten und sende anschließend selbst. Bei unklarer Rückmeldung bleibt ein offener Versand sichtbar; bestätige nur die wirklich verschickten Pakete.'},
        {target:'#sd-repeat-send-button',title:'Bearbeitung melden',text:'Nach erfolgreichem Versand zurück zur SD-Tabelle: „Antworten“ → „Bearbeitung eintragen“ → Beitrag prüfen → Senden. Die Meldung aktualisiert den Bedarf für alle Nutzer.'}
    ];
    if (context.context === 'forum-view_thread') return [
        {target:'#sd-register-thread',title:'SD-Tabelle festlegen',text:'Öffne den Beitrag mit der SD-Tabelle und klicke im SD Organizer auf „Als SD-Tabelle festlegen“. Danach sind die Tabellen- und Versandfunktionen für diesen Thread verfügbar. „SD-Tabelle festgelegt“ zeigt eine bereits gespeicherte Zuordnung. Neu erstellte SD-Threads werden automatisch zugeordnet.'},
        {target:'#requestBunker',title:'Bunker anfragen',text:'Öffne „Antworten“, dann „Bunker anfragen“. Füge Koordinaten und Paketmengen ein. Spieler, Bemerkung und Zeitfenster sind optional. „Bunker anfragen“ füllt den Beitrag; erst Senden veröffentlicht ihn.'},
        {target:'#sd-forum-quick-settings',title:'Massen-UT vorbereiten',text:'Öffne einmal Massen-UT, damit Gruppen und Vorlagen eingelesen werden. Wähle sie hier aus und aktiviere die Hilfe. Folge dann dem Link der gewünschten Anfrage in der Tabelle.'},
        {target:'#addBearbeitung',title:'Versand eintragen',text:'„Bearbeitung eintragen“ füllt deine gespeicherten Versandmeldungen ein. Prüfe und sende den Beitrag. Entwürfe werden erst bei bestätigtem Erfolg entfernt.'},
        ...(mod ? [{target:'.bbcodetable',title:'SD-Tabelle pflegen',text:'Als Foren-Mod kannst du den SD-Post bearbeiten und neue Anfragen und Versandmeldungen in die Tabelle übernehmen. Prüfe die berechnete Tabelle vor dem Speichern; Post-Cache und stabile IDs erhalten die Zuordnung.'}] : [])
    ];
    return [{target:'#sd-settings-root',title:'SD Organizer einrichten',text:'Ordne zuerst einen Foren-Thread als SD-Tabelle zu. Öffne Massen-UT einmal zum Einlesen von Gruppen und Vorlagen und wähle sie hier. Weitere Einführungen findest du auf den jeweiligen Seiten.'}];
}

export function initializeOnboarding(context:PageContext) {
    ensureOrganizerStyles();
    $('#sd-onboarding-launcher,#sd-onboarding-card').remove();
    $('.sd-tour-target').removeClass('sd-tour-target');
    const storage=LocalStorageHelper.getInstance();
    const mod=context.screen === 'forum' && isUserForumMod();
    const key=`${context.context}:${mod ? 'mod' : 'user'}`;
    const steps=getOnboardingSteps(context,mod);
    let state=storage.getOnboarding;
    const existing=state?.version === VERSION ? state.tours?.[key] : undefined;
    let step=Math.max(0,Math.min(steps.length-1,existing?.step ?? 0));
    const save=(paused:boolean,complete=false) => {
        const current=storage.getOnboarding;
        storage.setOnboarding={version:VERSION,tours:{...(current?.version === VERSION ? current.tours : {}),[key]:{step,paused,complete}}};
    };
    const close=() => {$('#sd-onboarding-card').remove();$('.sd-tour-target').removeClass('sd-tour-target');};
    const $launcher=$('<div id="sd-onboarding-launcher" style="padding:8px 0">');
    const $start=$('<input type="button" class="btn" value="Einführung starten">').appendTo($launcher);
    const $root=$('#sd-forum-quick-settings .sd-organizer-body,#sd-bunker-import-panel > div:last,#sd-settings-root').first();
    if ($root.is('table')) $('<caption>').append($launcher).prependTo($root);
    else if ($root.length) $root.append($launcher); else $('#content_value').prepend($launcher);
    const render=() => {
        close(); save(false);
        const item=steps[step];
        const $target=$(item.target).filter(':visible').first();
        $target.addClass('sd-tour-target');
        const $card=$('<div id="sd-onboarding-card" class="sd-organizer" role="dialog" aria-label="Einführung" style="position:fixed;left:14px;bottom:14px;width:340px;z-index:10000;padding:12px">');
        $card.append($('<b>').text(`${step+1}/${steps.length} · ${item.title}`),$('<p>').text(item.text));
        if (!$target.length) $card.append($('<p>').text('Das Bedienelement ist hier noch nicht sichtbar. Öffne gegebenenfalls „Antworten“ oder die passende SD-Anfrage. Du kannst die Einführung später fortsetzen.'));
        $('<input type="button" class="btn" value="Zurück">').prop('disabled',step===0).on('click',()=>{step--;render();}).appendTo($card);
        $('<input type="button" class="btn">').val(step===steps.length-1 ? 'Fertig' : 'Weiter').on('click',()=>{
            if (step===steps.length-1) {save(false,true);close();$launcher.find('.sd-tour-invite').remove();}
            else {step++;render();}
        }).appendTo($card);
        $('<input type="button" class="btn" value="Später fortsetzen">').on('click',()=>{save(true);close();}).appendTo($card);
        $('<input type="button" class="btn" value="Überspringen">').on('click',()=>{save(false,true);close();$launcher.find('.sd-tour-invite').remove();}).appendTo($card);
        $('body').append($card);
        $card.find('input').filter(':enabled').first().trigger('focus');
    };
    if ($root.length && !$root.is('table')) keepOrganizerInViewport($root.closest('.sd-organizer'));
    $start.on('click',()=>{step=0;render();});
    if (existing && !existing.complete) $('<input type="button" class="btn" value="Einführung fortsetzen">').on('click',render).appendTo($launcher);
    if (!existing && !$('#dbInfo_popup_box').length) $('<span class="sd-tour-invite"> Neu hier? Die Einführung zeigt die wichtigsten Abläufe.</span>').appendTo($launcher);
}
