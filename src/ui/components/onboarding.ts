import {PageContext} from '../../helpers/script-context';
import {isUserForumMod} from '../../helpers/tw-helper';
import {ensureOrganizerStyles} from './organizer-style';
import {initializeSetupOnboarding} from './setup-onboarding';
import {addHoverHelp, closeHoverHelp} from './hover-help';
import {getSettingsHelp} from './settings-help';
type Step={target:string; title:string; text:string};
export function getOnboardingSteps(context:PageContext, mod:boolean):Step[] {
    if (context.context === 'forum-new_thread' && mod) return [
        {target:'.sd-package-row',title:'Pakete definieren',text:'Eine Menge in Speer, Schwert oder Bogen skaliert diese Paketzeile. Späher sind 5 %. Ein Klick leert ein befülltes Feld. Weitere Pakete sind unabhängig.'},
        {target:'#setupTable',title:'SD-Tabelle vorbereiten',text:'„SD Tabelle generieren“ füllt den Forenbeitrag aus und schlägt bei leerem Titel „SD Tabelle“ vor. Ein Klick ins Titelfeld entfernt diesen Vorschlag; eigene Titel bleiben erhalten. Prüfe Titel und Text und sende den Thread im Spiel ab.'},
        {target:'input[name=subject]',title:'Thread erstellen und zuordnen',text:'Nach erfolgreichem Erstellen und beim Öffnen einer vorhandenen SD-Tabelle erkennt der Organizer den Tabellenbeitrag und speichert die lokale Zuordnung. Bei fehlenden Grundeinstellungen startet die Einrichtung direkt in der Tabelle.'}
    ];
    if (context.context === 'overview-away_detail') return [
        {target:'.sd-preset-buttons',title:'Paketgröße wählen',text:'100 oder 200 Dual enthält Speer und Schwert. Auf Bogenwelten enthält Trial zusätzlich Bogen. Eigene Paketgrößen und Power sind separat einklappbar.'},
        {target:'#sd-bunker-import-thread-id',title:'Ziel-Thread wählen',text:'Der Ziel-Thread muss vorher als SD-Tabelle gespeichert sein. Berechnet werden nur die hier sichtbaren Truppen; prüfe Filter und weitere Seiten.'},
        {target:'#sd-bunker-import-preview',title:'Vorschau prüfen',text:'Markiere die gewünschten Koordinaten. „Unter 5 entfernen“ entfernt auch vorhandene Anfrage-Entwürfe derselben Koordinaten im Ziel-Thread.'},
        {target:'#sd-import-bunker-requests',title:'Entwurf übernehmen',text:'Übernehmen speichert einen Anfrage-Entwurf. Öffne anschließend den Ziel-Thread, klicke „Bunker anfragen“, ergänze Angaben und fülle den Beitrag ein. Erst Senden im Spiel veröffentlicht die Anfrage.'}
    ];
    if (context.context === 'place') return [
        {target:'select[name=template]',title:'Gruppe und Vorlage einrichten',text:'Gruppen und Vorlagen werden direkt auf ihren Spielseiten erkannt und in den Einstellungen aktualisiert. Wähle dort deine SD-Gruppe und SD-Vorlage und aktiviere „Massen-UT automatisch vorbereiten“.'},
        {target:'.troop-request-selector',title:'Auswahl prüfen',text:'Öffne die Massen-UT über den Link der gewünschten SD-Anfrage. Prüfe Vorlage, verfügbare Truppen und Zeitfenster. Der Doppelversandschutz berücksichtigt bereits bearbeitete Anfragen.'},
        {target:'.evt-button-fill',title:'Übernehmen und senden',text:'„Übernehmen“ füllt die Spielauswahl. Prüfe die tatsächlich einzutragenden Einheiten und sende anschließend selbst. Bei unklarer Rückmeldung bleibt ein offener Versand sichtbar; bestätige nur die wirklich verschickten Pakete.'},
        {target:'#sd-repeat-send-button',title:'Bearbeitung melden',text:'Nach erfolgreichem Versand zurück zur SD-Tabelle: „Antworten“ → „Bearbeitung eintragen“ → Beitrag prüfen → Senden. Die Meldung aktualisiert den Bedarf für alle Nutzer.'}
    ];
    if (context.context === 'forum-view_thread') return [
        {target:'#sd-thread-setup-launcher',title:'Einrichtung aus der SD-Tabelle',text:'Erkannte SD-Tabellen werden beim Öffnen lokal zugeordnet. Fehlen Gruppe, Vorlage oder eine gültige Schwert-Laufzeit, beginnt die Einrichtung direkt hier. Über „Einrichtung fortsetzen“ bzw. „Einrichtung prüfen“ im Organizer kannst du jederzeit zurückkehren. Eine bewusst pausierte Einrichtung öffnet sich nicht von selbst.'},
        {target:'#requestBunker',title:'Bunker anfragen',text:'Öffne „Antworten“, dann „Bunker anfragen“. Füge Koordinaten und Paketmengen ein. Spieler, Bemerkung und Zeitfenster sind optional. „Bunker anfragen“ füllt den Beitrag; erst Senden veröffentlicht ihn.'},
        {target:'#sd-forum-quick-settings',title:'Massen-UT vorbereiten',text:'Wähle hier Gruppe und Vorlage und aktiviere die Vorbereitung. Die Listen werden direkt aus der Gruppenverwaltung und den Truppen-Vorlagen aktualisiert. Folge dann dem Link der gewünschten Anfrage in der Tabelle.'},
        {target:'#addBearbeitung',title:'Versand eintragen',text:'„Bearbeitung eintragen“ füllt deine gespeicherten Versandmeldungen ein. Prüfe und sende den Beitrag. Entwürfe werden erst bei bestätigtem Erfolg entfernt.'},
        ...(mod ? [{target:'.bbcodetable',title:'SD-Tabelle pflegen',text:'Als Foren-Mod kannst du den SD-Post bearbeiten und neue Anfragen und Versandmeldungen in die Tabelle übernehmen. Prüfe die berechnete Tabelle vor dem Speichern; Post-Cache und stabile IDs erhalten die Zuordnung.'}] : [])
    ];
    return [{target:'#sd-settings-root',title:'SD Organizer einrichten',text:'Ordne einen Foren-Thread als SD-Tabelle zu. Wähle hier deine SD-Gruppe und SD-Vorlage aus den direkt aktualisierten Listen. Die geführte Einrichtung startest du im Forum neben „Neuer Thread“ und „Neue Umfrage“.'}];
}

export function initializeOnboarding(context:PageContext) {
    initializeSetupOnboarding(context);
    if (!['place','overview-away_detail','forum-view_thread','forum-new_thread','settings'].includes(context.context)) return;
    ensureOrganizerStyles();
    closeHoverHelp();
    $('#sd-onboarding-launcher,#sd-onboarding-card,.sd-context-help-host,.sd-context-help').remove();
    $('.sd-tour-target').removeClass('sd-tour-target');
    const mod=context.screen === 'forum' && isUserForumMod();
    const steps=getOnboardingSteps(context,mod);
    const $root=$('#sd-forum-quick-settings .sd-organizer-body,#sd-bunker-import-panel > div:last,#sd-settings-root').first();
    const $header=$root.is('table') ? $root.find('th').first() : $root.closest('.sd-organizer').find('.sd-organizer-handle').first();
    const $host=$header.length ? $header : $('#content_value h2,#content_value h3').first();
    if ($header.length && !$root.is('table')) $header.addClass('sd-help-header');
    const introduction=context.context==='settings'
        ? 'Änderungen werden sofort gespeichert. Grüne Zeilen mit Häkchen zeigen gültige Werte oder aktive Schutzfunktionen. Die Einrichtung ist im SD Organizer der Tabelle sowie in der Forumübersicht neben „Neuer Thread“ und „Neue Umfrage“ erreichbar.'
        : 'Die geführte Einrichtung ist direkt im SD Organizer einer SD-Tabelle erreichbar und startet dort bei fehlenden Grundeinstellungen automatisch. In der Forumübersicht bleibt der Einstieg neben „Neuer Thread“ und „Neue Umfrage“ erhalten.';
    const sections=[{title:'Einrichtung und Einstellungen',text:introduction},...getSettingsHelp($root)];
    if (context.context!=='settings') sections.push(...steps.filter(step=>step.target!=='#sd-forum-quick-settings'));
    addHoverHelp($host,'SD Organizer – Hilfe',sections,'sd-onboarding-launcher');
}
