package com.jarvis.customapp

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.jarvis.customapp.R

class MainActivity : AppCompatActivity() {

    private lateinit var tvStatus: TextView
    private lateinit var btnExecute: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        tvStatus = findViewById(R.id.tvStatus)
        btnExecute = findViewById(R.id.btnExecute)

        tvStatus.text = "JARVIS Assistant: Systems Active"

        btnExecute.setOnClickListener {
            Toast.makeText(this, "JARVIS Directive Executed", Toast.LENGTH_SHORT).show()
            tvStatus.text = "Status: Nominal & Monitoring"
        }
    }
}
