<?php

// get the temporary name that PHP gave to the uploaded file
$tmp_filename=$_FILES["blob"]["tmp_name"];
$num = $_POST["num"];
error_log("tmp_filename:" . $tmp_filename);
// rename the temporary file (because PHP deletes the file as soon as it's done with it)
$tstamp = time();
$fname = "/tmp/uploaded_audio-" . $tstamp . "-" . $num . ".wav";
error_log("fname:" . $fname);
$succ = move_uploaded_file($tmp_filename,$fname);
error_log("succ:" . $succ);
//chmod($fname,0755);

?>
