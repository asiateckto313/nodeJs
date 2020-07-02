
let help_text = "Bienvenu(e) dans ToDolistBot. Ce bot vous permet de gérer vos tâches. Vous pouvez ajouter une nouvelle tâche ou afficher la liste de vos tâches\n"+

"\n\t\t*Ajouter une nouvelle tâche*"+"\n\t\tL'exemple suivant vous montre comment ajouter la tâche 'aller au marché':"+
"\n\t\t/add aller au marché"+


"\n\t\t*NOTE*: si vous souhaitez ajouter plusieurs tâches en même temps, il suffit de rentrer la première tâche comme précédemment et"+
" les tâches qui suivent doivent être, chacune, à la ligne comme l'indique l'exemple suivant : "+
"\n\t\tExemple: "+
" /add aller au marché"+
"\naller chez le dentiste"+
"\nacheter des sacs poubelle"+
"\nfaire la vaisselle"+


"\n\n*Afficher la liste de vos tâches*"+
"\n\t\tPour avoir la liste de vos tâches, il suffit d'envoyer la commande /get."+

"\n\t\t*NOTE*: saisissez simplement /get et rien d'autre !!"+

"\n\n*Cocher une tâche (✅)*"+
"\n\t\tPour marquer une tâche comme terminée ou effectuée : "+
"\n\t\t1. D'abord, envoyer la commande /get pour avoir la liste de vos tâches"+
"\n\t\t2. Ensuite, envoyer la commande /check suivie du numéro de votre tâche qui a été effectuée (1,2,...)"+
"\n\t\t(Exemple: /check 2)"+

"\n\n*Retirer une tâche de votre liste*"+ "\n\t\tTout comme la commande /check, envoyer la commande /remove suivie du numéro de votre tâche à retirer de votre liste"+
"\n\t\tExemple: /remove 2"+ 
"\n\n*Supprimer une liste*"+ 
"\n\t\tPour supprimer une liste (tâches effectuées ou tâches à faire), il suffit d'envoyer la commande /reset todolist ou /reset checklist selon l'exemple suivant : "+
"\n\t\t/reset todolist (supprime ma liste de tâches à faire)"+
"\n\t\t/reset checklist (supprime ma liste de tâches effectuées)"+
"\n\t\t*NOTE* : Si vous avez coché au moins une tâche, n'oubliez pas d'afficher votre liste en envoyant la commande /get"+ 
"\n\n*Afficher les boutons de commande*"+ 
"\n\t\tEnvoyer la commande /commands pour afficher les mêmes commandes (/add, /get, /check, /remove, /help) mais en format de bouton."+
"\n\n\tEt surtout, n'hésitez pas à me contacter à l'adresse suivante : ";
let help_text_suite = "@superPablo_E. Merci d'avance et amusez-vous bien ☺️"
let add_todo_text = "Envoyez moi la tâche à ajouter s'il vous plaît 😊", todo_added_text = "👍 Votre tâche a bien été ajoutée ☺️", 

welcome_command_text = function(username){
    return "Bonjour @"+ username+" et merci d'utiliser mon bot. N'hésitez pas à me signaler un quelconque problème. Amusez-vous bien 😏."},
check_command_text = "👍Votre tâche a été ajoutée à la liste de tâches terminées. Suppression de la tâche en cours...",invalid_index_text= "Index invalide", remove_command_text = "👍 Votre tâche a bien été supprimée 😊",
serialize_msg_todolist_text = "Vos tâches à faire : \n",serialize_msg_checklist_text = "\n\nVos tâches accomplies : \n",check_empty_text= "⚠️ Vous n'avez aucune tâche, veuillez s'il vous plaît ajouter au moins une tâche avant d'afficher la liste.",
remove_empty_todo = "😕Impossible de supprimer une liste ne contenant aucune tâche. Veuillez s'il vous plaît ajouter une tâche avant de la supprimer.",
reset_success_text = "La liste a bien été réinitialisée", remove_index_text = "Envoyez moi le numéro de la tâche à supprimer s'il vous plaît",
check_index_text = "Envoyez moi le numéro de la tâche à marquer comme terminée s'il vous plaît",
commands_button_text = "*Que souhaitez-vous faire ?*";

module.exports = {
    help_text,
    help_text_suite,
    add_todo_text,
    todo_added_text,
    welcome_command_text,
    check_command_text,
    invalid_index_text,
    remove_command_text,
    serialize_msg_todolist_text,
    serialize_msg_checklist_text,
    check_empty_text,
    remove_empty_todo,
    reset_success_text,
    remove_index_text,
    check_index_text,
    commands_button_text
}